// --- 类型定义 ---

// ID 值的可能类型
type ID = string | number

// 树节点的基础接口
interface TreeNode {
  [key: string]: any
}

// 用于存储找到的每个 ID 及其上下文信息的接口
interface FoundItemContext {
  id: ID
  node: TreeNode // 包含该 id 的节点对象
  parent: TreeNode | null // 该节点的父对象，根节点则为 null
}

/**
 * 遍历一个树形结构的数组，找出所有重复的指定键名的值，
 * 并打印出每一次出现时的完整对象及其父对象信息。
 *
 * @param treeArray - 要检查的树形结构数组。
 * @param keyName - 要查找的键名，默认为 'id'。
 * @returns 返回一个 Map，键是重复的值，值是包含该值所有出现上下文的数组。
 */
export function findDuplicateIdsInTreeWithContext(
  treeArray: TreeNode[],
  keyName: string = 'id',
): Map<ID, FoundItemContext[]> {
  // 1. 收集所有 ID 及其上下文信息
  const allItems: FoundItemContext[] = []

  /**
   * 递归遍历函数，用于深入每个节点并收集信息。
   * @param data - 当前要遍历的数据。
   * @param parent - 当前节点的父节点。
   */
  function collectItems(data: unknown, parent: TreeNode | null): void {
    const items = Array.isArray(data) ? data : [data]

    for (const item of items) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        // 检查当前 item 是否包含目标 key
        if (Object.prototype.hasOwnProperty.call(item, keyName)) {
          const idValue = item[keyName]
          if (typeof idValue === 'string' || typeof idValue === 'number') {
            allItems.push({
              id: idValue,
              node: item, // 当前节点
              parent: parent, // 当前节点的父节点
            })
          }
        }

        // 继续向内遍历所有属性
        for (const key in item) {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            const value = item[key]
            if (value && typeof value === 'object') {
              // 递归调用时，将当前 item 作为下一层的 parent
              collectItems(value, item)
            }
          }
        }
      }
    }
  }

  // 从顶层开始遍历，初始父节点为 null
  collectItems(treeArray, null)

  console.log(`扫描完成，共找到 ${allItems.length} 个 '${keyName}' 字段。`)

  // 2. 按 ID 对所有找到的项进行分组
  const itemsGroupedById = new Map<ID, FoundItemContext[]>()
  for (const item of allItems) {
    if (!itemsGroupedById.has(item.id)) {
      itemsGroupedById.set(item.id, [])
    }
    itemsGroupedById.get(item.id)!.push(item)
  }

  // 3. 找出重复项并打印详细信息
  const duplicates = new Map<ID, FoundItemContext[]>()
  itemsGroupedById.forEach((items, id) => {
    if (items.length > 1) {
      duplicates.set(id, items)
    }
  })

  if (duplicates.size > 0) {
    console.log(`\n---------- 发现 ${duplicates.size} 个重复的 '${keyName}' 值 ----------`)
    duplicates.forEach((items, id) => {
      // 使用 console.group 来创建可折叠的日志组，使输出更清晰
      console.group(`❌ 值 ${JSON.stringify(id)} 重复出现了 ${items.length} 次:`)

      items.forEach((context, index) => {
        console.log(`\n  [第 ${index + 1} 次出现]`)

        console.log('  - 所在对象 (Node):')
        // 使用 JSON.stringify 美化输出对象
        console.log(JSON.stringify(context.node, null, 2).replace(/^/gm, '    '))

        console.log('  - 所属父级 (Parent):')
        if (context.parent) {
          console.log(JSON.stringify(context.parent, null, 2).replace(/^/gm, '    '))
        } else {
          console.log('    (位于顶层，无父节点)')
        }
      })

      console.groupEnd()
    })
    console.log('-------------------------------------------')
  } else {
    console.log(`\n✅ 未发现重复的 '${keyName}' 值。`)
  }

  return duplicates
}
