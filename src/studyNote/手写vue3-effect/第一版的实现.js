/**
 * 手写实现 vue3 effect 方法
 */

let activeEffect = null // 记录当前的函数
const depsMap = new Map() // 记录依赖关系
const effectStack = [] // 保存函数栈

function track(target, key) {
  if (activeEffect) {
    let deps = depsMap.get(key) // 根据属性值去拿函数的集合
    if (!deps) {
      deps = new Set()
      depsMap.set(key, deps)
    }
    activeEffect.deps.push(deps)
    // 将依赖的函数添加到集合中
    deps.add(activeEffect)
  }
  console.log('depsMap', depsMap)
}
function trigger(target, key) {
  // 这里面就需要运行依赖的函数
  const deps = depsMap.get(key)
  if (deps) {
    const effectsToRun = new Set(deps); // 复制一份集合，防止在执行过程中修改原集合
    effectsToRun.forEach(effect => effect())
  }
}
// 原始对象
const data = {
  a: 1,
  b: 2,
  c: 3,
}
// 代理对象
const state = new Proxy(data, {
  get(target, key) {
    track(target, key) // 进行依赖收集
    return target[key]
  },
  set(target, key, value) {
    target[key] = value
    trigger(target, key) // 派发更新
    return true
  },
})
function effect(fn) {
  const environment = () => {
    activeEffect = environment
    // 将当前的函数推入到栈中，其实就是在模拟真是的函数栈
    effectStack.push(environment)
    // 清理依赖
    cleanup(environment);
    // 记录当前的函数
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  // 用来记录该环境是在哪些集合中的

  environment.deps = []
  environment();
}

function cleanup(environment) {
  // 拿到当前环境的依赖数组 
  let deps = environment.deps
  if (deps) {
    deps.forEach(dep => {
      dep.delete(environment)
      if (dep.size === 0) {
        for (let [key, value] of depsMap) {
          if (value === dep) {
            depsMap.delete(key)
          }
        }
      }
    })
    deps.length = 0
  }
}
effect(() => {
  if (state.a === 1) {
    state.b;
  } else {
    state.c;
  }
  console.log("执行了函数1");
});
effect(() => {
  console.log(state.a);
  console.log(state.c);
  console.log("执行了函数2");
});
state.a = 2;