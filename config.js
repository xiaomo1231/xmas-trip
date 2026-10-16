// 共享待办清单设置。
// 留空（null）时，清单只保存在各自手机的浏览器里，四人之间不同步。
// 想让四个人实时同步：按 README.md 里“共享清单（Firebase）”一节建好项目，
// 再把 Firebase 控制台给出的配置粘到下面，替换掉 null。
window.TRIP_FIREBASE = null;

/* 示例（换成你自己项目的值）：
window.TRIP_FIREBASE = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  appId: "1:1234567890:web:abcdef",
  collection: "trip-todos"
};
*/
