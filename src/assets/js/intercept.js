/**
 * @description 防止sql注入
 * 替换 sql 正则字符串 ， 添加 `#@@#` 至字符串 第一位。.
 * formatSql 在拦截器中定位添加.
 * formatRes 在响应器中拦截删除.
 * @Date 2021-11-09
 */


const intercept = {
  // sql注入
  formatSql: function(data) {
    let str = JSON.stringify(data);
    let reg = /\b(select|update|and|or|delete|insert|trancate|char|into|substr|ascii|declare|exec|count|master|drop|execute|if|when|sleep)\b/g;
    let res = str.match(reg);
    if (res && res.length) {
      let list = Array.from(new Set(res));
      for (let i = 0; i < list.length; i++) {
        let sqlReg = new RegExp('\\b(' + list[i] + ')\\b', 'g');
        str = str.replace(sqlReg, list[i].substr(0, 1) + '`#@@#`' + list[i].substr(1));
      }
      return JSON.parse(str);
    } else {
      return data;
    }
  },
  formatRes: function(response) {
    let str = JSON.stringify(response, (key, val) => typeof val === 'undefined' ? '' : val);
    let reg = '`#@@#`';
    if (str.indexOf(reg) > -1) {
      str = str.replace(/`#@@#`/g, '');
      return JSON.parse(str);
    } else {
      return response;
    }
  }
};
export default intercept;
