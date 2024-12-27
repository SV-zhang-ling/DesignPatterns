# v0.0.160

2024.10.31

# HighLights

- 增加https的访问方式

# Improve
- Fix P#725 patient页面session不会超时
- Fix P#1010 保存多张图像：单张血流图像+B-scan组合图
- Fix P#1176 患者页面，患者信息和患者采集信息右键后出现菜单，滚轮进行滑动后菜单跟着页面进行滑动
- Fix P#1200 服务器版清理二级缓存策略
- Fix P#1282 Mosaic协议添加的userinput没有绑定分层
- Fix P#1295 导出文件名称需要脱敏处理
- Fix P#1314 选择数据列表中采集时间显示不全
- Fix P#1315 选择数据列表中切换附属数据时操作不便
- Fix P#1317 PA页面列表hover和active样式不要重叠
- Fix P#1323 Https功能块添加
- Fix P#1328 切换导航线时Cscan发生变化
- Fix P#1336 PicassoManager隐藏同步授权功能
- Fix P#1342 局域网自签证书的https协议下WebSocket变更解决
- Fix P#1351 截屏后图像名称中仅有设备号和患者ID
- Fix P#1353 血流-视网膜增强页面保存的图像类型应该为EnhancedAngio
- Fix P#1355 报告页面的SN和Ver需要与后面的值之间增加冒号（：）
- Fix P#1361 nginx目录下文件未放置到GitHub中管理
- Fix P#1362 前节-三维数据Bscan的重置视图功能未生效


# Test Results

All manual test passed on Chrome

---


# v0.0.150

2024.10.17

# Improve
- Fix P#341 Bscan图像显示比例未生效
- Fix P#1070 属于Picasso的请求需要将URL中对的api替换成picasso
- Fix P#1158 VangoghService安装时不需要桌面图标
- Fix P#1192 三维数据页面：CScan切换图组件
- Fix P#1197 在PicassoService中实现数据库升级功能
- Fix P#1243 图像右键长按拖动缩放要以鼠标点为中心
- Fix P#1252 3D数据后端没有缓存，每次都需要重新计算
- Fix P#1257 三维数据页面：Cscan图右键菜单功能
- Fix P#1264 userinput在未保存的图像上全屏和退出全屏会消失
- Fix P#1278 保存多张图像：OCT+B-scan组合图
- Fix P#1281 Mosaic增加userinput后不能全屏和右键
- Fix P#1283 非智能和水平方向时向上拖动分层线Cssan图像不会变化
- Fix P#1284 3D图像退出全屏时会使Bscan取消放大状态
- Fix P#1287 Cscan下拉菜单中默认没有显示出脉络膜层
- Fix P#1288 编辑分层以后结构投射图未进行更新
- Fix P#1289 结构投射图输入userinput后切换页面时会保存两次
- Fix P#1292 Cscan上的userinput无需保存
- Fix P#1294 数据被释放后也一直提示数据被占用
- Fix P#1297 再次进入同一页面时缩略图没有重新请求
- Fix P#1300 高级分割页面编辑分层以后识别内容没有更新
- Fix P#1307 保存的组合图上Bscan图像位置偏下
- Fix P#1308 组合图Bscan图像显示不全
- Fix P#1312 组合图下载过程中会增加一个竖向滚动条


# Test Results

All manual test passed on Chrome

---

# v0.0.140

2024.09.27

# HighLights

- 后节-三维数据页面
- 前节-三维数据页面

# Improve

- Fix P#408 三维数据分析页面框架
- Fix P#410 三维数据分析页面看图功能
- Fix P#415 三维数据页面：各图右键菜单功能
- Fix P#417 三维数据页面：底部图像控制功能
- Fix P#985 前端按最新 UI 提供规范修改文字和日期格式
- Fix P#1150 双眼/对比亮度/对比度调整
- Fix P#1167 前端增加首次登录/密码过期修改密码功能
- Fix P#1174 三维数据页面：前节数据适配
- Fix P#1180 使用线扫数据进入分析页面，图片放大后使用图像增强，左下角出现 loading 状态
- Fix P#1185 刚打开报告时打印时间应该为进入报告页面的时间
- Fix P#1191 VangoghService 后端 3D 数据的生成及前端联调
- Fix P#1202 Mosaic 协议设备号需要显示为空
- Fix P#1210 过期时间为时间戳只有大于该时间戳以后才会提示
- Fix P#1212 当前密码不正确时没有提示
- Fix P#1213 新密码和原密码一样时未进行提示
- Fix P#1214 通过 PicassManager 修改密码时没有更新 UpdateTime 字段
- Fix P#1217 三维数据页面截屏功能
- Fix P#1227 左右的 3D 眼球上 TN 方向错误
- Fix P#1228 3D 图像的默认方向错误
- Fix P#1229 3D 图像的图像缺失部分显示为灰色
- Fix P#1230 正视时 3D 图像边缘为曲线存在畸变
- Fix P#1231 前节 3D 视图需要去掉眼睛后面的图像
- Fix P#1236 Mosaic 协议的信号强度不能显示为 0
- Fix P#1237 线扫描协议的长度数值与数字之间没有空格
- Fix P#1238 线扫描协议长度数值没有做小数点后的保留位数处理
- Fix P#1240 vangoghservice 重启时缩短刷新网盘时间间隔
- Fix P#1246 3d 模型组件优化（相机方位和全屏）
- Fix P#1248 PicassoManager 中增加修改注册表中默认密码功能
- Fix P#1253 修改分层以后血流图像没有更新

# Test Results

All manual test passed on Chrome

---

# v0.0.130

2024.09.07

# Improve

- Fix P#282 angio/oct/slo/bscan 图上右键左右拖动可调整对比度，上下拖动可调整透明度
- Fix P#354 登录时请求参数中密码没有加密
- Fix P#752 SvMessenger 中实现消息的广播和接收
- Fix P#818 添加 Logo 导出单通道的图片，保存为单通道，减小图片大小
- Fix P#836 保存同一样图像 Picasso 的图像大小是 VG 的两倍
- Fix P#881 PicassoService 软件崩溃
- Fix P#949 PicassoService 退出时，发通知给各个服务器
- Fix P#950 端到端验证[调研]
- Fix P#958 load 数据时 VangoghService 崩溃
- Fix P#982 按照新标准来截图以及水印操作
- Fix P#1007 报告打印功能
- Fix P#1043 第一次登录后要求修改账号密码
- Fix P#1045 密码过期时间
- Fix P#1094 保存单张图像：更新为前端加水印
- Fix P#1102 远程映射盘空间不足时，前端增加提示
- Fix P#1104 编辑文本时按键盘左右方向键没有移动光标，移动的是 Y 轴导航线
- Fix P#1107 线扫描页面双眼/对比页面增加 userinput，重新 load 数据后 Bscan 上的 userinput 未显示出来
- Fix P#1108 密码明文传输修改为 base64 解密
- Fix P#1109 Picasso 数据库备份
- Fix P#1110 双眼和对比页面切换时没有进行 userinput 的保存
- Fix P#1112 保存多张图像：各层血流图/结构投射图
- Fix P#1113 前端 3D 展示调研
- Fix P#1115 添加用户密码长度限制为 8 位，且区分大小写
- Fix P#1120 取消不同眼别模式切换以后添加一次 userinput 后无法再打开右键菜单
- Fix P#1121 配合前端导出图片
- Fix P#1122 PicassoManager 新增用户失败
- Fix P#1123 所有可用盘列表缺少部分映射盘
- Fix P#1128 备份数据库超过 7 份时没有删除之前备份数据库
- Fix P#1129 备份的数据库为空
- Fix P#1130 用户登录失败
- Fix P#1132 Picassoservice 重启的时候没有调用 reset 接口
- Fix P#1134 中文界面时报告中的性别没有翻译
- Fix P#1135 切换数据后报告中的描述信息没有清空
- Fix P#1136 需要将报告中的“生日”改为“出生日期”
- Fix P#1139 描述中内容没有自动换行
- Fix P#1141 报告中的英文和 VG 保持一致
- Fix P#1142 姓名和检查医生过长时，字段名称不需要换行显示
- Fix P#1143 同一个数据 Picasso 报告中自动需要换行显示，而 VG 不需要换行
- Fix P#1144 新映射盘接入时不要重启 VGService，自动识别
- Fix P#1145 文件目录太长了，笔记本上无法直接打开
- Fix P#1152 VGService 给 reset 接口适配接口读写锁
- Fix P#1156 报告打印预览时尾部缺失设备号和版本号信息
- Fix P#1157 Mosaic 结构投射图接口中需要增加调节亮度和对比度功能
- Fix P#1161 报告描述中不能使用键盘方向键移动光标位置
- Fix P#1162 用户断开映射盘时主动断开数据库连接
- Fix P#1163 数据库、映射盘及采集文件查询逻辑文档整理
- Fix P#1168 手动分层页面下载的结构投射图与界面显示图像不一致
- Fix P#1175 OCT 视野去掉增强功能和最新版 VG 保持一致
- Fix P#1178 高级分割页面增加量化图的亮度和对比度调节功能

# Test Results

All manual test passed on Chrome

---

# v0.0.121

2024.09.05

# Improve

- Fix P#1149 star 协议扫描中心位置错误
- Fix P#1154 前端增加系统升级检测并提示用户刷新

# Test Results

All manual test passed on Chrome

---

# v0.0.120

2024.08.23

# HighLights

- 前节-手动分层页面
- Fix P#1006 分析页面截屏功能

# Improve

- Fix P#659 统一线扫 slo 坐标系
- Fix P#783 前节手动分层
- Fix P#785 前节手动分析定位线
- Fix P#870 软件崩溃重启刷新分析页面后返回患者页面没有释放内存资源
- Fix P#929 结构投射图无去伪影功能
- Fix P#947 对比页面血流图和 Bscan 没有测量功能
- Fix P#986 对比页面未加载附属的 userinput
- Fix P#987 对比页面附属数据的 Bscan 退出全屏以后主数据 Bscan 上面的 userinput 没有显示出来
- Fix P#1002 双眼/对比 userinput
- Fix P#1029 线扫描页面的 SLO 图上未增加测量功能
- Fix P#1034 前节手动分层：新增相关入口
- Fix P#1035 前节手动分层：弹窗中各个图适配
- Fix P#1036 前节手动分层：分层展示前节各分层
- Fix P#1037 前节手动分层：分层线分段展示及分割线展示
- Fix P#1038 前节手动分层：Bscan 上方小图标适配及右侧工具栏适配
- Fix P#1039 前节手动分层：关闭弹窗分析页面更新
- Fix P#1044 多次登录失败禁止继续尝试，锁定该用户
- Fix P#1046 远程映射的 VG 盘空间过小，导致保存失败的情况，给出防御措施
- Fix P#1050 退出登录的时候 Picassoservice 报一个 20106 的错误码
- Fix P#1051 load 数据失败 log 提示读取文件失败
- Fix P#1052 前节手动分层：分层线调整
- Fix P#1053 双眼/对比调用 get 接口报错
- Fix P#1056 get 接口返回结果中箭头缺少 type 字段
- Fix P#1057 双眼和对比页面主副数据的 detail 接口被重复调用
- Fix P#1062 双眼页面切换至对比页面时前端仅显示出框架
- Fix P#1063 双眼和对比页面都加载完成以后直接返回至患者页面时 VangoghService 崩溃
- Fix P#1064 load 数据时出现异常 log “can not find Degree56”
- Fix P#1068 箭头部分所显示位置和 VG 中略有差异
- Fix P#1073 用户被锁定后，前端增加弹窗提示
- Fix P#1074 关闭显示编辑线以后移动分界线时会显示出编辑层
- Fix P#1075 仅调整分界线没有触发保存和取消提示
- Fix P#1076 线扫描手动分层-瞳孔相机的增强功能无效
- Fix P#1078 用户锁定后重新输入 7 次时才再次锁定
- Fix P#1081 线扫描-切换编译后的 Bscan 时索引和 TN 方向没有更新
- Fix P#1088 第五次登录失败后直接返回 3010002
- Fix P#1089 单机版映射盘掉线以后会影响访问效率
- Fix P#1090 同时有多个请求时在 log 中不容易区分哪个些是一个完整的请求
- Fix P#1091 前端调用获取结构投射图接口时存在无效参数
- Fix P#1095 保存截图的出生日期后面多了 6 个 0
- Fix P#1096 保存的截屏水印部分过大，显示效果不佳
- Fix P#1098 Mosaic 协议需要不显示深度信息
- Fix P#1101 映射盘重连后一直为处于已断开连接状态
- Fix P#1103 PicassoService 打包过程存在警告信息
- Fix P#1105 所有导出的截图都没有深度信息

# Test Results

All manual test passed on Chrome

---

# v0.0.110

2024.08.09

# HighLights

- Mosaic-结构投射图页面
- 前节-结构投射图页面
- 新增 websocket 功能
- 新增文本功能

# Improve

- Fix P#681 前端控制不能打开多个 Tab
- Fix P#812 刷新页面时 bscan 接口提示缺少参数
- Fix P#848 前节结构投射图：左侧菜单
- Fix P#849 前节结构投射图：页面适配相应调整
- Fix P#854 [Picasso]websocket 主动推送功能
- Fix P#855 [AnalysisService]优化目前分析框架
- Fix P#862 右键菜单测量功能：插入文本与后端接口联调
- Fix P#867 单击版 load 不同数据时 Vangoghservice 崩溃
- Fix P#899 改进 capture 数据占用的整个流程
- Fix P#911 修改完分层暂存以后前端页面一直处于加载中状态
- Fix P#920 手动分层暂存以后 slow-Bscan 的没有显示编辑状态
- Fix P#935 save 接口参数结构优化
- Fix P#944 Mosaic-结构投射图页面
- Fix P#946 生产模式 定位源码错误方便排查问题
- Fix P#951 前节结构投射图：新增相关入口
- Fix P#953 caputre 数据读入及释放改为读写锁
- Fix P#954 单个 capture 数据加载使用寿命管理
- Fix P#959 编辑过分层以后再 reset all 关闭弹窗会提示是否保存
- Fix P#968 前节结构投射图页面的 Bscan 上缺少导航线
- Fix P#969 对比页面双击全屏或退出全屏时出现异常
- Fix P#971 userinput 没有区分分层
- Fix P#972 去掉右键菜单每个选项之间的空隙，缩短右键菜单的长度
- Fix P#973 返回 patient 页面时附属数据未 release
- Fix P#974 打开选择数据列表时 SLO 图像显示异常
- Fix P#976 统一线扫 Bscan 坐标系
- Fix P#978 输入 userinput 退出编辑状态后通过浏览器后退键返回至 patient 页面时 userinput 保存失败
- Fix P#979 Bscan 上的 userinput 无法达到右下角图例附近
- Fix P#981 使用浏览器的后退键以后血流页面无法切换导航线和 Bscan
- Fix P#988 patient 页面采集信息列表中的日期所在行也可以右键修改备注
- Fix P#989 血管成像和血流增强页面的血流图开关增强功能时页面会闪一下遮罩层
- Fix P#992 插入文本右键退出编辑状态会变慢
- Fix P#994 手动分层编辑区域右键多出一个灰框
- Fix P#995 返回 patient 页面失败，页面显示异常
- Fix P#996 Bscan 上插入的 userinput 会变大
- Fix P#1001 打开两个 tab 页相互刷新页面时 vangoghservice 崩溃
- Fix P#1005 AS cube 协议结构投射图未显示出来
- Fix P#1008 打开多 tab 页面的提示增加中文翻译
- Fix P#1011 先进入线扫描页面再切换其他页面打开手动分层时 Bscan 图像加载不出来
- Fix P#1013 返回之前页面时显示图像被重新请求计算
- Fix P#1017 仅输入 IP 和地址时默认进入 patient 页面，而不是 login 页面
- Fix P#1020 VG 重启以后 Picasso 服务器获取远程映射盘的是未连接状态，但数据库已经连接正常
- Fix P#1021 SLO 缩略图未显示无数据图像
- Fix P#1022 真实页面图像是对比页面，却显示为单眼模式
- Fix P#1024 Bscan 上有文本后每次切换页面或者返回 patient 页面都会进行保存 userinput
- Fix P#1028 线扫描协议进入页面时先调用了 userinput 的 get 接口
- Fix P#1030 Mosaic 协议的结构投射图右键未增加测量功能

# Test Results

All manual test passed on Chrome

---

# v0.0.100

2024.07.26

# HighLights

- 结构投射图页面
- 手动分层-编辑区域
- Mosaic 血流-视网膜增强页面
- 新增测量尺和箭头功能

# Improve

- Fix P#496 同步 UserInputs
- Fix P#613 右键菜单测量功能：测量尺(Ruler)和清除全部(Clear All)与后端接口联调
- Fix P#772 手动分层：编辑分层弹窗中间编辑分层功能
- Fix P#789 后节手动分层接口修改及联调
- Fix P#801 手动分层：编辑分层弹窗中 Bscan 上方小图标操作
- Fix P#817 修改完分层关闭弹窗，分析页面各个图需要更新
- Fix P#823 perf: 优化手动分层在两侧时的交互和插值计算方式
- Fix P#829 SvMessager 区分不同软件消息分流功能
- Fix P#840 手动分层修改的编辑层和参考层会同步至其他页面
- Fix P#843 后节结构投射图增加相关入口和跳转逻辑
- Fix P#844 后节结构投射图：左侧缩略图
- Fix P#845 后节结构投射图：中间 4 个大图功能
- Fix P#846 后节结构投射图：各个图上右键菜单功能
- Fix P#847 后节结构投射图：右侧工具栏功能
- Fix P#850 结构投射图 适配传递 surface 作为参数
- Fix P#852 后端实施服务器端验证的协商缓存
- Fix P#856 Mosaic 血流-视网膜增强页面：增加入口和相关跳转逻辑
- Fix P#857 Mosaic 血流-视网膜增强页面：左侧缩略图部分
- Fix P#858 Mosaic 血流-视网膜增强页面：中间大图及顶部功能
- Fix P#859 右键菜单测量功能：插入箭头与后端接口联调
- Fix P#860 右键菜单测量功能：优化测量尺(Ruler)功能
- Fix P#861 后端实现 UserTools 保存
- Fix P#874 由线扫描界面切换至结构投射图页面时未勾选图像平滑度
- Fix P#875 结构图投射图 Bscan 增强功能无效
- Fix P#880 调研目前 userInputs 写入缓慢原因。
- Fix P#883 双眼和对比页面图像平滑未显示数值
- Fix P#885 Mosaic-视网膜增强页面重置视图功能无效
- Fix P#889 前端更新 release 缓存时机
- Fix P#891 Userinput 在 Bscan 上测量完以后不显示测量结果且页面所有图像不能弹出右键菜单
- Fix P#892 主数据的 Userinput 同步到了附属数据上面
- Fix P#893 测量时鼠标点击的位置和测量尺起点位置不一致
- Fix P#894 OCT 视野的测量结果修改时超出了图像范围
- Fix P#900 保存用户输入时会再调用一次血流图和结构投射图的接口
- Fix P#901 UserInput 切换页面的时候会保存一次，不做修改的情况下返回 patient 页面会再保存一次
- Fix P#903 Picasso 在血流图和结构投射图上增加的 userinput 在 VG 上不显示
- Fix P#906 Userinput 保存失败时前端显示的超时而不是 60101
- Fix P#908 不同的提示信息样式和背景颜色不一致
- Fix P#909 修改结构投射图颜色时会同时触发修改分层线
- Fix P#912 双眼和对比的页面 Bscan 的右键菜单有“编辑分层”选项
- Fix P#913 双击锚点时未删除该锚点
- Fix P#915 手动分层的 slow-Bscan 未做图像平滑处理
- Fix P#916 线扫描页面 Bscan 颜色与手动分层界面不一致
- Fix P#917 关闭显示编辑线功能后仍能添加锚点
- Fix P#918 不修改分层时【保存】和【取消】按钮置灰
- Fix P#921 使用 W 和 S 切换编辑过的 Bscan 功能无效
- Fix P#923 修改过多个 Bscan 后再重置分层，仍可以切换之前编辑过的 Bscan
- Fix P#924 不修改分层或仅修改一个 Bscan 时“编辑 Bscan”的上下按钮需要置灰
- Fix P#925 打开手动分层时没有判断登录是否超时
- Fix P#926 userinput 请求未做超时处理导致切换页面时该接口一直连续请求
- Fix P#939 VG 结构投射图上的 userinput 没有同步至 Picasso

# Test Results

All manual test passed on Chrome

---

# v0.0.090

2024.07.12

# HighLights

- 血流-视网膜增强页面
- 手动修改分层弹窗(除中间编辑分层部分)

# Improve

- Fix P#707 [AnalysisService]资源清理修改（关联用户）
- Fix P#712 前端相应地方增加切换页面调用接口释放缓存
- Fix P#714 单机版两个用户同时 load 数据时 VangoghService 崩溃
- Fix P#727 远程特检失联的情况下会在 D 盘产生 analysis 文件
- Fix P#757 单机版在 OU 和 change 页面加载较大数据时软件崩溃
- Fix P#768 手动分层：新增入口和右键菜单编辑分层选项
- Fix P#769 手动分层：编辑分层弹窗左侧列图
- Fix P#770 手动分层：编辑分层弹窗左侧图上右键菜单
- Fix P#771 手动分层：弹窗右侧工具栏和 Bscan 上方小图标
- Fix P#773 手动分层：Slow Bscan 全屏
- Fix P#774 手动分层二次确认功能：关闭弹窗、Reset All、Cancel 和保存功能
- Fix P#777 血流-视网膜增强页面：新增页面入口及相关跳转逻辑
- Fix P#778 血流-视网膜增强页面：页面整体结构和左侧缩略图展示
- Fix P#779 血流-视网膜增强页面：各个图的展示和右侧工具栏
- Fix P#780 血流-视网膜增强页面：各个图的右键菜单功能
- Fix P#782 激光眼投射图
- Fix P#784 前节手动分层厚度图
- Fix P#787 mosaic 视网膜增强 （适配）
- Fix P#788 mosaic 结构图（适配）
- Fix P#791 VG 和 Picasso 的高级分割页面布局不一致
- Fix P#792 切换 Bscan 时主数据分层线没有更新
- Fix P#794 附属数据默认状态下没有显示分层线
- Fix P#804 资源不足前端增加相应提示信息
- Fix P#807 资源相关统一测试
- Fix P#815 前后节血流及结构投射图测试对接
- Fix P#819 血流增强非视网膜光凝也不能修改血流颜色
- Fix P#820 重置分层时仅重置图像未重置右侧分层信息
- Fix P#825 手动分层右侧编辑分层区域有纵向滚动条
- Fix P#826 手动分层结构投射图默认不需要开始增强
- Fix P#827 手动分层窗口上下没有居中
- Fix P#828 编辑层为色素上皮脱离层时厚度图和结构投射图显示不正确
- Fix P#833 slow-Bscan 没有增加绿框
- Fix P#834 参考层为脉络膜时结构投射图显示不正确
- Fix P#835 slow-Bscan 上有右键菜单
- Fix P#837 血流双眼和对比页面 Bscan 无绿色边框

# Test Results

All manual test passed on Chrome

---

# v0.0.080

2024.06.28
备注：该版本包含有 v0.0.070 的功能。

# HighLights

- 后节线扫描双眼页面
- 后节线扫描对比页面
- 后节血流成像双眼页面
- 后节血流对比双眼页面

# Improve

## v0.0.070

- Fix P#406 后端返回正常人眼 RNFL 厚度分布图
- Fix P#501 解决不同机器相同 PatientID 数据访问问题
- Fix P#524 [AnalysisService]增加各个模块 UML 图
- Fix P#577 [AnalysisService]0.0.070
- Fix P#605 统一坐标系
- Fix P#612 UserInputs 坐标系统整理
- Fix P#614 后节线扫页面：头部基本信息增加眼别可切换、选择数据和同步下拉配置
- Fix P#615 双眼和随访选择数据弹窗
- Fix P#616 后节线扫双眼（OU）页面展示和交互
- Fix P#617 同步（Synchronize）操作相关交互功能
- Fix P#618 后节线扫随访（Change）页面展示和交互
- Fix P#619 后节线扫双眼和随访页面：底部导航线和扫描范围
- Fix P#620 后节手动分层接口
- Fix P#622 视网膜增强(适配)
- Fix P#624 后节结构图（适配）
- Fix P#625 前节结构投射图
- Fix P#626 后节线扫双眼和随访页面增加相关入口和交互逻辑
- Fix P#652 单机版 load 数据未提示资源占用也未显示图像
- Fix P#682 [PicassoService 安全合规]数据库备份
- Fix P#684 [PicassoService 安全合规]用户登录登出日志
- Fix P#687 合并 master 到 vangoghservice 分支并解决冲突
- Fix P#688 VanGoghService 代码整体进行一次 astyle 格式调整
- Fix P#690 Basic 版 CPU 使用率检测逻辑修改

## v0.0.080

- Fix P#672 merge Master 分支并作格式上的修改
- Fix P#691 血流和前节线扫页面的双眼和随访需要关闭
- Fix P#693 血管成像双眼和随访分析页面框架和入口开发
- Fix P#694 血流双眼分析页面展示和相关交互
- Fix P#695 血流随访分析页面展示和相关交互
- Fix P#696 血流双眼和随访页面各右键菜单功能
- Fix P#697 血流双眼和随访页面同步功能
- Fix P#698 血流双眼和随访页面：底部导航线、Layer On Bscan 和血流信号
- Fix P#700 主数据导航线同步功能
- Fix P#702 [AnalysisService]前节血流结构投射图
- Fix P#703 提供前端所有登录用户接口
- Fix P#704 后节结构投射图接口重置/更新（Shift 适配）
- Fix P#705 [AnalysisService]接收 Requset 用户信息
- Fix P#706 [PicassoService]添加用户信息到 Requset
- Fix P#708 [AnaylsisService]前节结构投射图/重置/更新（shift 适配）
- Fix P#709 [PicassoService 安全合规]当前登录用户 List
- Fix P#710 [AnaylsisService]后节结构投射图接口（Shift 适配）
- Fix P#719 模型文件由 models 改为 plugins 导致打包失败
- Fix P#721 部分协议没有进入双眼和对比页面的功能
- Fix P#722 血流优化功能没有生效
- Fix P#723 全视野模式下切换导航线功能异常
- Fix P#726 [PicassoService]Picasso 每个操作关联用户
- Fix P#728 进入双眼和对比页面的逻辑更新
- Fix P#729 VangoghService 增加 mock 模式
- Fix P#730 用户超时自动退出时 log 中没有进行提示
- Fix P#734 load 未分析过的数据时 detial 接口变慢
- Fix P#736 双眼切换选择数据时界面会触发遮罩层
- Fix P#739 主数据全屏后显示的是附属数据的图像
- Fix P#741 再次选择数据时 SLO 图显示异常
- Fix P#742 选择数据时特检机失联 selectdata 接口响应时间达到 56s
- Fix P#743 选择数据时远程特检机失联时前端页面显示异常
- Fix P#744 选择数据时默认选择附属数据
- Fix P#746 刷新页面后主数据和附属数据不显示长度和深度
- Fix P#747 选择数据列表中默认时没有将主数据显示出来
- Fix P#748 OU 和 change 页面没有显示出随访队列
- Fix P#750 双眼和对比页面血流图右键不需要血流颜色
- Fix P#751 用户主动或被动退出时 Picasso 通知分析服务器清理缓存
- Fix P#754 血流对比页面左侧数据全屏显示效果异常
- Fix P#758 vangoghservice 不同文件模式参数不统一
- Fix P#765 main 上 DREAM OCT 正在使用的中文提示信息错误

# Test Results

All manual test passed on Chrome

---

# v0.0.062

2024.06.18

# HighLights

- 切换页面时增加遮罩层

# Improve

- Fix P#679 单机版在分析过程中连续刷新页面 VangoghService 会崩溃
- Fix P#678 在 Bscan 上移动导航线位置以后再双击放大或缩小时会触发遮罩层
- Fix P#677 血流图和结构投射图移动导航线位置后。再单击移动导航线交点时会触发遮罩层
- Fix P#670 前节切换 Bscan 过程中会出现 Bscan 图像和分层线不匹配
- Fix P#660 前节线扫描页面关闭分层线以后切换 Bscan 显示的分层线不连续
- Fix P#658 后端崩溃重启，前端页面超时以后没有撤销遮罩层导致无法尽心后续操作
- Fix P#657 关闭血流信号和识别内容时屏幕会闪一下
- Fix P#654 进入分析页面以后直接使用键盘上下键切换 Bscan 时屏幕会闪一下
- Fix P#653 资源占用时脉络膜大中血管没有显示出设别内容
- Fix P#651 关闭资源占用提示以后血流图像还显示为加载中
- Fix P#650 资源占用提示中还显示的是 VG 软件正在使用
- Fix P#649 Mosaic 协议在卡片模式不显示缩略图
- Fix P#647 VangoghService 的 configs 目录下有 service.cfg 的加密文件
- Fix P#641 前端将无数据图像进行缓存，导致再次请求时无法获取正确图像
- Fix P#639 服务器重启以后 VangoghService 访问不到远端数据
- Fix P#638 重启服务器以后 VangoghService 在托盘中没有产生图标
- Fix P#636 切换缩略图过程中不需要增加遮罩层
- Fix P#635 缩略图在加载过程中仍可以切换
- Fix P#628 分析页面加载中增加全局遮罩，禁止用户其它操作
- Fix P#627 不允许使用 U 盘来 smb 协议共享
- Fix P#621 Basic 版本电脑重启以后需要登录以后才能自启动服务
- Fix P#603 Basic 版本占用内存已经超出 10G
- Fix P#601 VangoghService 卸载后有残留文件
- Fix P#598 Service.cfg 文件需要修改

# Test Results

All manual test passed on Chrome

---

# v0.0.061

2024.05.28

# HighLights

- Fix P#560 同步逻辑更新，前端更新分析页面请求接口传参为 capturekey
- 取消 IP 相关配置
  - Fix P#580 [PicassoService]取消 ip 相关配置，改为自动并配置数据同步文件
  - Fix P#581 [AnalysisService]取消 IP 相关配置，启动时动态获取各特检机 IP
  - Fix P#582 [AnalysisService]切换同步数据读取目录，修改为固定 D:/capture/{ip}

# Improve

- Fix P#335 开启 Auto zoom Bscan 后有部分 Bscan 图像未显示出来
- Fix P#470 加载相同患者 ID 相同采集时间的数据
- Fix P#500 [调研]不同机器相同 PatientID 数据访问问题
- Fix P#540 数据同步的配置文件需要打包进安装包
- Fix P#544 已开启自适应窗口的 Bscan 全屏以后显示的效果没有自适应窗口
- Fix P#546 load 没有分析过的数据会在同步数据的目录下生成 analysis 文件
- Fix P#549 basic 版本需要在血流图和高级分割页面再做限制
- Fix P#550 VangoghService 中需要加入版本号信息
- Fix P#556 PicassoManager 需要提供安装包版本
- Fix P#570 数据库连接成功时对映射盘状态进行刷新
- Fix P#572 [AnalysisSrvice]061 Basic 版本 Release
- Fix P#573 Basic 版应该无数据库相关设置，直接读取本地数据库
- Fix P#574 Picasso 添加日志版本号信息
- Fix P#575 右键菜单测量功能：测量尺(Ruler)和清除全部(Clear All)
- Fix P#578 [AnalysisService]整理 CaptureKey 相关内容
- Fix P#579 [AnalysisService]CaptureKey 添加到返回列表中
- Fix P#583 [AnalysisService]封装公共方法，获取当前所有 SMB 协议的网盘
- Fix P#585 血流反色图下载的图像仅有 1K 无法打开
- Fix P#586 VangoghService 软件名称与控制台名称不一致
- Fix P#588 VG Service console 不输出 LOG
- Fix P#593 分析页面出生日期显示不正确
- Fix P#594 basic 版在血流图和高级分割页面做限制，前端增加弹窗提示信息
- Fix P#596 删除 service.cfg 文件已弃用的参数
- Fix P#599 分析页面的 url 中还包含有 patientID、captureID 和 IP
- Fix P#609 重启服务器以后 VangoghService（advance 版）获取不到消息队列

# Test Results

All manual test passed on Chrome

---

# v0.0.060

2024.05.18

# HighLights

- 增加前节 Bscan 页面
- 增加高级分割页面

# Improve

- Fix P#257 拖动导航线的过程中会出现 Bscan 血流信号与当前 Bscan 明显不一致的情况
- Fix P#300 前节加载未分析数据时的 dewarp 处理
- Fix P#331 拖动 Y 轴导航线时出现血流图像导航线和 Bscan 导航线没有对齐
- Fix P#411 高级分割页面：量化图
- Fix P#412 高级分割页面：slo 叠脉络膜大中血管和视网膜下积液
- Fix P#413 高级分割页面：bscan 叠脉络膜大中血管和视网膜下积液
- Fix P#416 高级分割页面：底部图像控制功能
- Fix P#437 拖动导航线更新 Bscan 图：需要确保最后停下来时 Bscan 和血流展示图与相应索引一致
- Fix P#443 返回前节 surface 的分层信息
- Fix P#472 前节 B-scan：页面展示及相关跳转逻辑
- Fix P#473 前节 B-scan：Bscan 图和分层线展示
- Fix P#477 前节 B-scan：各个图的右键菜单功能
- Fix P#498 修改读取、写入分析文件逻辑
- Fix P#502 Picasso 不同登录用户修改病人信息互斥[调研]
- Fix P#509 右键菜单：新增重置视图(Reset VIew)操作
- Fix P#511 分析页面加载中增加图像操作小技巧提示
- Fix P#512 前端内存溢出导致界面操作无响应
- Fix P#514 [AnalysisService]根据给定的 Protocol 获取符合条件的 OU Capture List
- Fix P#515 [AnalysisService]根据给定的 Protocol 获取符合条件的 Change Capture List
- Fix P#520 [AnalysisService] 适配 Basic 版本提供无 Console 版本的 App
- Fix P#521 [Picasso] 适配 Basic 版本提供无 Console 版本的 App
- Fix P#522 DREAM OCT 增加 Mock 模式
- Fix P#523 Capture Detail 增加 Follow
- Fix P#528 修改 PicassoService 默认安装路径
- Fix P#529 修改 VangoghService 默认安装路径
- Fix P#530 VangoghService 卸载时需要先暂停 PicassHost
- Fix P#547 VangoghService 运行期间崩溃
- Fix P#554 [AnalysisService]添加 Capture Key
- Fix P#555 关闭导航线以后点击血流图还是切换导航线位置
- Fix P#558 高级分割页面结构投射图显示与 VG 不一致
- Fix P#559 患者编号相同时在分析页面刷新时会切换显示另外患者信息
- Fix P#564 用户名中存在“.”时无法保存图像
- Fix P#567 结构投射图的增强功能失效
- Fix P#569 登录超时切换全视野和 OCT 视野没有跳转至登录页面

# Test Results

All manual test passed on Chrome

---

# v0.0.050

2024.05.06

# HighLights

- Fix P#404 Mosaic 协议分析页面
- Fix P#409 Angio 和 Cube 协议对应线扫页面
- Fix P#427 2D 图像的标准鼠标交互更新：左键 + 右键

# Improve

- Fix P#303 缩略图上的扫描范围展示
- Fix P#304 缩略图上的扫描范围的后端信息返回
- Fix P#320 长时间未使用请求不到患者列表数据
- Fix P#338 Fast Bscan 打开 Auto zoom Bscan 后图像显示效果不正确
- Fix P#348 设计修改 UserInput 的后端保存方案及评审
- Fix P#353 修改上下边界参考层后对应的偏移量未重置为 0
- Fix P#395 增加分析服务器的同步文件清理功能
- Fix P#396 后端增加厚度 map 的返回接口
- Fix P#397 后端增加血流量化的 map 返回
- Fix P#400 iSCSI 挂载盘重启后重连问题调研
- Fix P#405 Mosaic 协议分析页面：右键菜单功能
- Fix P#407 高级分割页面框架
- Fix P#414 高级分割页面：各图右键菜单功能
- Fix P#418 分析页面修改备注返回到患者页面后，所有患者和采集数据的备注信息都无法进行修改
- Fix P#419 增加血流量化界面的测量功能
- Fix P#422 Angio 和 Cube 协议对应线扫页面：右键菜单功能
- Fix P#423 共享网盘映射挂载失效问题
- Fix P#425 FreeFileSync 安装目录讨论
- Fix P#433 Mosaic 协议采集信息不需要显示长度、深度和信号强度的具体数值
- Fix P#435 Mosaic 页面开关血流优化功能没有更新缩略图
- Fix P#441 增加开关控制主动分析功能，并取消同步 analysis 文件
- Fix P#444 不同页面之间没有同步 fast 方向导航线位置
- Fix P#446 切换页面时未增加“加载中”的中间页面
- Fix P#447 cube 协议和 ONH 协议图像平均不显示 repeat 次数 1
- Fix P#448 不同图像的显示颜色会相互影响
- Fix P#449 不同页面之间的图像平滑相互影响
- Fix P#450 患者页面 Mosaic 协议信号强度需要设置为空
- Fix P#451 卡片模式随访队列显示错误
- Fix P#459 线扫描页面图像平滑显示错误
- Fix P#462 血流颜色缺少一个热力图
- Fix P#476 患者页面缩略图扫描线箭头显示不全
- Fix P#488 血流图像点击增强时会修改导航线位置
- Fix P#489 移动分层按钮需要做不能连续点击的限制
- Fix P#490 连续修改分层以后再修改血流信号状态会导致血流信号状态失效
- Fix P#494 超大视野数据血流分析页面的分层缩略图显示不全
- Fix P#495 采集列表中点击日期仍显示上个数据的 SLO 缩略图
- Fix P#503 前端页面患者出生日期显示不正确

# Test Results

All manual test passed on Chrome, Edge

---

# v0.0.041

2024.04.16

# HighLights

- Fix P#301 实现特检机和分析服务器的 Capture 数据同步
- Fix P#349 后端数据的主动分析功能
- Fix P#364 为 VGService 创建 Basic 运行模式和 Advanced 运行模式

# Improve

- Fix P#220 前端基础组件封装：线扫眼底图组件
- Fix P#222 前端基础组件封装：星扫眼底图组件
- Fix P#289 线扫分析页面各个图的右键菜单功能
- Fix P#296 提供后节血流拼图页面的接口
- Fix P#316 log 中去掉毫秒后无用的三位 000，仅保留至毫秒即可
- Fix P#319 重启 PicassoService 后没有新建 log 文件
- Fix P#322 web 端没有更新特检机修改的分层数据
- Fix P#333 拖动导航线释放鼠标左键后，导航线还跟随鼠标移动
- Fix P#347 网络异常连接远端数据库失败以后需要等待到下次一轮巡连接才能恢复
- Fix P#350 Basic 版问题调研及解决
- Fix P#357 后节结构线扫描页面展示及相关逻辑更新
- Fix P#358 PA 页面采集列表下方和卡片模式中缩略图（SLO）上展示扫描范围
- Fix P#359 后节线扫页面交互：眼底图上滚动鼠标可切换缩略图列表中高亮 Bscan
- Fix P#360 后节线扫页面交互：眼底图上滚动鼠标可切换右侧 Bscan 图
- Fix P#361 后节线扫页面交互：Bscan 图上导航线和 SLO 图上扫描范围展示和隐藏功能
- Fix P#362 在关闭 Bscan 上血流信号后，切换 Bscan，再打开血流未更新血流信号
- Fix P#363 解读 VG 中血流和线扫页面的 AutoBScan 逻辑并输出文档
- Fix P#365 master merge to VanGoghService 并解决冲突
- Fix P#368 后节线扫页面：SLO 图与 Bscan 图联动功能
- Fix P#375 PicassoHost 的 log 文件未存放在 log 目录下

# Test Results

All manual test passed on Chrome, Edge

---

# v0.0.040

2024.03.29

# HighLights

- 完成血流页面功能开发
- Fix P#281 Auto Zoom Bscan 自动缩放 Bscan

# Improve

- Fix P#204 Picasso 安装包的运行环境检测及服务的持续运行
- Fix P#251 首次加载缩略图时出现相同数据调用两次
- Fix P#252 找不到 capture 数据时需要进行提示
- Fix P#253 服务器重启后服务未自动启动
- Fix P#254 血流页面缩略图未加载出来
- Fix P#255 在本地首次加载没有缓存的数据，血流页面未显示图像信息及框架
- Fix P#259 血流页面加载缩略图过程中返回 patient 页面，页面显示异常
- Fix P#260 在血流分析页面点击分析下拉菜单中的血管成像请求的地址不正确
- Fix P#261 首次 load 数据快速拖动导航线时页面崩溃
- Fix P#264 VangoghService 运行期间崩溃
- Fix P#265 五官科版安装包打包内容
- Fix P#267 切换分层缩略图的时候缩略图会重新加载
- Fix P#268 图像放大以后再恢复原来大小后可以移动
- Fix P#269 采集信息面板中没有显示深度信息
- Fix P#271 ctrl+滚轮放大 Bscan 同时也在切换不同 Bscan 图像
- Fix P#273 图像全屏以后没有右键功能
- Fix P#275 Ctrl+双击 全屏图像功能未实现
- Fix P#276 血流图像默认显示的是增强效果
- Fix P#277 血流图和结构投射图上导航线上代表扫描方向的箭头没有显示
- Fix P#278 Bscan 上分层线不容易选中和拖动
- Fix P#280 远程特检机上未分析的数据 load 失败
- Fix P#283 分析页面右键菜单保存图像功能
- Fix P#291 修改备注时前端输入允许的最大长度字符后保存失败
- Fix P#292 调整分层线输入框中可以输入非整数
- Fix P#294 PicassoSerivce 的日志功能
- Fix P#295 VangoghSerivce 的日志功能
- Fix P#297 后端返回 UserInputs 的接口实现
- Fix P#298 后端读取远程特检机上 Capture 文件时的性能调研及改进
- Fix P#299 VangoghService 的错误码统一整理及排他处理强化
- Fix P#305 图像保存接口联调
- Fix P#306 血流分析页面各个图的图像增强功能
- Fix P#311 删除所有备注信息时提示修改失败
- Fix P#312 SLO 部分数据开启增强后图像明显变暗，显示效果与 VG 差距较大
- Fix P#314 PicassoHost 无法单独重启 nginx 服务
- Fix P#315 打印的 log 基本都是 debug 级别
- Fix P#324 Bscan 上分层线展示与否功能-Layer on Bscan
- Fix P#327 关闭\打开导航线的时候会一定关闭\打开分层线
- Fix P#330 PicassoService 失效，导致无法登录
- Fix P#332 图像放大以后移动时需要按 Ctrl 键
- Fix P#336 关闭导航线以后拖动鼠标还可以移动导航线位置和切换 Bscan 图像
- Fix P#339 部分内容未翻译或英文拼写不规范
- Fix P#340 前节 AS angio 协议也可以进入血管成像页面
- Fix P#342 Cataract Biometry 生物测量数据不需要显示信号强度值
- Fix P#343 患者信息列表排序功能失效
- Fix P#344 患者采集信息列表中表头字段排序与需求不一致
- Fix P#351 图像最大化以后按 Ctrl+双击不能最小化图像

# Test Results

All manual test passed on Chrome, Edge

---

# v0.0.030

2024.3.15

# Improve

- Fix P#162 PA 页面增加右键菜单修改备注功能
- Fix P#171 VangoghService 修改备注接口实现
- Fix P#187 需要在页面上禁掉浏览器右键功能
- Fix P#210 VanGoghService 局域网内 hostlist 配置文件维护
- Fix P#209 采集数据 operator 字段获取
- Fix P#215 PA 患者列表和当前患者采集数据列表定时刷新(<=2min)
- Fix P#216 血流页面看图基本功能实现
- Fix P#217 血流投射图头部展示采集信息和修改采集弹窗
- Fix P#218 血流页面 BScan 上血流分层调整功能
- Fix P#219 分析页面各个图上右键菜单组件
- Fix P#221 前端基础组件封装：BScan 缩略图组件
- Fix P#223 后节结构线扫描页面结构及跳转逻辑
- Fix P#224 PicassoService 和分析服务器绑定的基本授权实现
- Fix P#226 单张 angio/bscan/slo 图像的保存接口实现
- Fix P#227 PicassoService 配置工具：配置登陆用户增加和修改
- Fix P#228 断网及特检机失联等异常情况的防御和改进
- Fix P#229 血流页面手动分层调整后端实现
- Fix P#230 加载未分析的 Capture 数据
- Fix P#231 实现高级分割页面的脉络膜大中血管识别和脉络膜血流接口
- Fix P#232 高级分割页面的 SRF 识别功能接口
- Fix P#233 血流页面看图增强功能实现
- Fix P#241 Picasso 修改的备注在 VG 上显示异常
- Fix P#274 图像放大以后点击浏览器后退按钮直接返回至 patient 页面
- Fix P#302 维持服务的持续运行

# Test Results

All manual test passed on Chrome, Edge

---

# v0.0.020

2024.3.1

# Improve

- Fix P#152 为 VangoghService 设计和开发 Relase 流程
- Fix P#155 为 PicassoService 设计和开发 Release 流程
- Fix P#157 BScan 组件封装
- Fix P#161 用户切换和退出登录功能
- Fix P#163 PA 页面切换采集数据刷新底部缩略图
- Fix P#164 分析页面除看图部分外整体框架
- Fix P#166 AngioBScan 图片组件
- Fix P#167 血流分析页面血流层次缩略图组件封装
- Fix P#168 SLO/OCT 叠加图展示组件封装
- Fix P#169 血流页面展示整体框架
- Fix P#170 VangoghService 用户切换和退出登录功能的后台实现
- Fix P#172 VangoghService 中实现多个 Vangogh 数据库的访问和结果合并
- Fix P#173 VangoghService 实现缩略图的获取和返回
- Fix P#174 VangoghService 中的 Capture 数据的详细信息获取
- Fix P#175 VangoghService 中实现血流分析基本接口
- Fix P#197 采集数据列表默认不是按时间倒序排序
- Fix P#200 登录超后在 Patient 页面切换采集数据时未跳转至登录页面

# Test Results

All manual test passed on Chrome, Edge

---

# v0.0.010

2024.2.9

# HighLights

- Fix P#129 PA 页面开发：患者列表和 Capture 列表

# Improve

- Fix P#97 VangoghService 工程基本框架搭建
- Fix P#98 PicassoService 工程基本框架搭建
- Fix P#100 VangoghService Patient 和 Capture 数据获取接口实现
- Fix P#101 PicassoService 消息队列管理组件开发(SvMessenger)
- Fix P#102 VangoghService 后端缓存管理组件开发
- Fix P#106 前端统一开发平台框架搭建
- Fix P#107 登录页面和多语言切换功能
- Fix P#108 前端影像看图组件封装
- Fix P#109 前端基本组件本地化
- Fix P#111 屏幕不同尺寸自适应
- Fix P#114 前端 OpenCV 处理方法封装
- Fix P#115 前端十字线组件封装
- Fix P#116 PicassoService 路由整理
- Fix P#118 后端整体流程走通
- Fix P#119 自动化测试流程的设计
- Fix P#120 Doxygen 自动生成接口 API 文档
- Fix P#127 PicassoService 身份认证模块
- Fix P#128 前端基础组件库封装：PA 卡片模式数据卡片组件
- Fix P#132 封装 GeneralImageViewer ，仅仅用于缩略图等简单的图片展示组件
- Fix P#144 封装支持 png/jpeg 的看图组件 imageViewer

# Test Results

All manual test passed on Chrome, Edge

## Remaining Bugs
