# JS基础-22：Fix Module can only be default-imported using the ‘allowSyntheticDefaultImports’ flag issue

---

## 问题现象

![Untitled](JS%E5%9F%BA%E7%A1%80-22%EF%BC%9AFix%20Module%20can%20only%20be%20default-imported%20us%2060a269ef8ada4513998abb64f2480b8a/Untitled.png)

## 原因

模块采用export = 导出的，没有默认导出。

尝试在tsconfig.json中添加allowSyntheticDefaultImports 没有任何效果，当然你的场景可能有效，可以试试

## 解决方法

```tsx
import * as mime from "mime";

const mimeInstance = (mime as any).default;
```

> **提示：由于不知道*as mime后是什么，可以打断点看看，看完你就知道怎么使用了**
> 

## 参考文献

- [**Fix Module can only be default-imported using the ‘allowSyntheticDefaultImports’ flag issue**](https://medium.com/@liwp.stephen/fix-module-can-only-be-default-imported-using-the-allowsyntheticdefaultimports-flag-issue-a033a361c6bf)
- [https://itecnote.com/tecnote/r-this-module-is-declared-with-using-export-and-can-only-be-used-with-a-default-import-when-using-the-esmoduleinterop-flag/](https://itecnote.com/tecnote/r-this-module-is-declared-with-using-export-and-can-only-be-used-with-a-default-import-when-using-the-esmoduleinterop-flag/)
