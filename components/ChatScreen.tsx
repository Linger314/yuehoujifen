import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, MoreHorizontal, PlusCircle, Smile, MapPin, 
  Keyboard, Image as ImageIcon, Camera, Wifi, X, Globe, ArrowUp, Plus, ChevronDown, Pencil, Trash2, Loader2
} from 'lucide-react';
import { Message, UserProfile, MessageType } from '../types';
import { recognizeHandwrittenCharacter } from '../services/geminiService';

const USERS: Record<string, UserProfile> = {
  user: { id: 'user', name: '我', avatarChar: '我', color: 'bg-green-600' },
  blade: { id: 'blade', name: 'Blade', avatarChar: '刀', color: 'bg-blue-600' },
  head: { id: 'head', name: 'Head', avatarChar: '头', color: 'bg-sky-500' },
};

const MESSAGE_LIFETIME_MS = 6000;

// Short beep data URI for simulated audio
const BEEP_AUDIO_DATA = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'; 

// Enhanced Pinyin Mapping
const PINYIN_MAP: Record<string, string[]> = {
  'a': ['啊', '阿', '爱', '安', '暗', '按'],
  'ai': ['爱', '唉', '矮', '挨', '哎'],
  'an': ['安', '按', '暗', '岸', '案'],
  'b': ['不', '吧', '被', '把', '变', '本', '比', '边'],
  'ba': ['吧', '把', '爸', '八', '拔', '罢'],
  'bai': ['白', '百', '拜', '败'],
  'ban': ['办', '半', '班', '搬', '版', '板'],
  'bang': ['帮', '棒', '榜', '绑'],
  'bao': ['包', '报', '保', '宝', '抱', '爆'],
  'bei': ['被', '北', '杯', '背', '备', '倍', '悲'],
  'ben': ['本', '笨', '奔'],
  'bi': ['比', '笔', '必', '毕', '币', '闭', '壁'],
  'bian': ['变', '边', '便', '编', '遍'],
  'biao': ['表', '标', '彪'],
  'bie': ['别', '憋'],
  'bin': ['宾', '滨'],
  'bing': ['并', '病', '兵', '冰'],
  'bo': ['波', '播', '伯', '博', '脖'],
  'bu': ['不', '部', '步', '布', '补', '捕'],
  'c': ['才', '吃', '出', '次', '从', '错', '车'],
  'ca': ['擦'],
  'cai': ['才', '菜', '猜', '踩', '采', '彩'],
  'can': ['餐', '参', '残', '惨'],
  'cang': ['藏', '仓'],
  'cao': ['草', '操', '槽'],
  'ce': ['侧', '策', '测', '册', '厕'],
  'cen': ['参'],
  'ceng': ['层', '曾'],
  'cha': ['差', '查', '茶', '插', '叉'],
  'chai': ['拆', '柴'],
  'chan': ['产', '单', '铲', '颤'],
  'chang': ['常', '长', '场', '唱', '厂', '倡', '偿'],
  'chao': ['超', '朝', '抄', '吵', '潮'],
  'che': ['车', '彻', '撤'],
  'chen': ['陈', '沉', '晨', '尘', '衬'],
  'cheng': ['成', '城', '程', '称', '承', '乘', '诚', '呈', '撑'],
  'chi': ['吃', '持', '迟', '池', '尺', '赤', '翅'],
  'chong': ['重', '充', '冲', '虫'],
  'chou': ['抽', '愁', '丑', '臭'],
  'chu': ['出', '处', '初', '楚', '除', '触'],
  'chuan': ['传', '穿', '船', '串'],
  'chuang': ['床', '创', '窗', '闯'],
  'chui': ['吹', '垂', '锤'],
  'chun': ['春', '纯', '唇'],
  'chuo': ['戳'],
  'ci': ['次', '此', '词', '辞', '刺', '赐'],
  'cong': ['从', '聪', '匆'],
  'cou': ['凑'],
  'cu': ['粗', '促', '醋', '簇'],
  'cuan': ['窜'],
  'cui': ['催', '脆', '翠'],
  'cun': ['存', '村', '寸'],
  'cuo': ['错', '措', '搓'],
  'd': ['的', '到', '大', '对', '都', '点', '地', '当'],
  'da': ['大', '打', '达', '答', '搭'],
  'dai': ['带', '待', '代', '戴', '袋', '贷'],
  'dan': ['但', '单', '蛋', '担', '弹', '淡'],
  'dang': ['当', '党', '挡', '档'],
  'dao': ['到', '道', '倒', '刀', '导', '岛', '盗'],
  'de': ['的', '得', '地', '德'],
  'dei': ['得'],
  'deng': ['等', '灯', '登', '瞪'],
  'di': ['地', '第', '低', '底', '弟', '帝', '敌'],
  'dian': ['点', '电', '店', '典', '垫'],
  'diao': ['掉', '调', '钓', '吊'],
  'die': ['爹', '跌', '叠', '碟'],
  'ding': ['定', '顶', '订', '丁', '盯'],
  'diu': ['丢'],
  'dong': ['动', '东', '懂', '冬', '洞', '冻'],
  'dou': ['都', '豆', '斗', '抖', '陡'],
  'du': ['度', '读', '独', '都', '堵', '赌', '肚'],
  'duan': ['短', '断', '段', '端'],
  'dui': ['对', '队', '堆'],
  'dun': ['顿', '蹲', '盾'],
  'duo': ['多', '躲', '夺', '朵'],
  'e': ['额', '饿', '恶', '鹅'],
  'en': ['恩'],
  'er': ['而', '二', '儿', '耳'],
  'f': ['发', '非', '分', '风', '放', '反', '复'],
  'fa': ['发', '法', '罚', '乏', '伐'],
  'fan': ['反', '翻', '饭', '烦', '凡', '犯', '范'],
  'fang': ['放', '方', '房', '防', '访', '芳'],
  'fei': ['非', '飞', '费', '废', '肥'],
  'fen': ['分', '份', '粉', '奋', '纷'],
  'feng': ['风', '封', '丰', '疯', '峰'],
  'fo': ['佛'],
  'fou': ['否'],
  'fu': ['复', '服', '付', '父', '福', '富', '夫', '负', '副', '附'],
  'g': ['个', '过', '给', '更', '感', '告', '工'],
  'ga': ['尬'],
  'gai': ['该', '改', '盖', '概'],
  'gan': ['感', '干', '敢', '赶', '甘', '杆'],
  'gang': ['刚', '港', '钢', '缸', '岗'],
  'gao': ['高', '告', '搞', '稿', '糕'],
  'ge': ['个', '各', '歌', '格', '哥', '隔', '割'],
  'gei': ['给'],
  'gen': ['跟', '根'],
  'geng': ['更', '耕', '梗'],
  'gong': ['工', '公', '共', '功', '宫', '攻', '供', '弓'],
  'gou': ['够', '狗', '沟', '勾', '构', '购'],
  'gu': ['古', '股', '顾', '故', '骨', '孤', '姑'],
  'gua': ['挂', '刮', '瓜'],
  'guai': ['怪', '乖', '拐'],
  'guan': ['关', '管', '官', '观', '馆', '惯', '冠'],
  'guang': ['光', '广', '逛'],
  'gui': ['归', '贵', '鬼', '规', '轨', '柜'],
  'gun': ['滚', '棍'],
  'guo': ['过', '国', '果', '锅'],
  'h': ['好', '和', '很', '会', '后', '话', '还'],
  'ha': ['哈'],
  'hai': ['还', '海', '害', '孩'],
  'han': ['汉', '汗', '寒', '喊', '含'],
  'hang': ['行', '航'],
  'hao': ['好', '号', '豪', '耗'],
  'he': ['和', '喝', '合', '河', '何', '贺', '核'],
  'hei': ['黑', '嘿'],
  'hen': ['很', '恨', '痕'],
  'heng': ['横', '恒'],
  'hong': ['红', '轰', '洪', '哄', '宏'],
  'hou': ['后', '候', '厚', '猴', '吼'],
  'hu': ['护', '乎', '互', '湖', '户', '虎', '呼', '忽', '胡'],
  'hua': ['话', '花', '化', '画', '华', '划', '滑'],
  'huai': ['坏', '怀'],
  'huan': ['换', '还', '环', '欢', '幻', '患'],
  'huang': ['黄', '慌', '晃', '皇', '谎'],
  'hui': ['会', '回', '灰', '挥', '辉', '毁', '慧'],
  'hun': ['婚', '混', '魂', '昏'],
  'huo': ['活', '火', '或', '货', '获', '伙'],
  'j': ['就', '家', '见', '进', '叫', '几', '经', '机'],
  'ji': ['几', '机', '记', '急', '计', '集', '级', '极', '即', '基', '挤', '鸡', '寄', '继', '寂'],
  'jia': ['家', '加', '假', '价', '架', '驾', '佳'],
  'jian': ['见', '间', '件', '建', '简', '坚', '减', '检', '剑', '渐', '践'],
  'jiang': ['将', '讲', '江', '降', '奖'],
  'jiao': ['叫', '交', '教', '角', '脚', '觉', '焦', '娇'],
  'jie': ['接', '节', '解', '姐', '界', '借', '街', '结', '介', '届'],
  'jin': ['进', '金', '今', '近', '仅', '紧', '尽', '斤'],
  'jing': ['经', '精', '静', '惊', '京', '警', '镜', '净', '竞', '敬', '井'],
  'jiong': ['炯', '窘'],
  'jiu': ['就', '九', '旧', '酒', '久', '救', '究'],
  'ju': ['句', '举', '巨', '局', '具', '居', '剧', '距', '聚'],
  'juan': ['卷', '捐', '倦'],
  'jue': ['觉', '决', '绝', '角'],
  'jun': ['军', '君', '俊', '均'],
  'k': ['看', '可', '开', '快', '块', '考', '口'],
  'ka': ['卡'],
  'kai': ['开', '凯'],
  'kan': ['看', '刊', '砍'],
  'kang': ['康', '抗'],
  'kao': ['考', '靠'],
  'ke': ['可', '科', '客', '刻', '课', '克', '渴'],
  'ken': ['肯', '啃'],
  'keng': ['坑'],
  'kong': ['空', '控', '孔', '恐'],
  'kou': ['口', '扣'],
  'ku': ['哭', '苦', '库', '裤', '酷'],
  'kua': ['夸', '跨'],
  'kuai': ['快', '块'],
  'kuan': ['款', '宽'],
  'kuang': ['况', '狂', '框', '矿'],
  'kui': ['亏', '愧'],
  'kun': ['困', '坤'],
  'kuo': ['阔', '扩'],
  'l': ['了', '来', '里', '老', '拉', '两', '路'],
  'la': ['拉', '啦', '辣'],
  'lai': ['来', '赖'],
  'lan': ['蓝', '兰', '懒', '烂', '拦', '篮'],
  'lang': ['浪', '狼', '郎', '朗'],
  'lao': ['老', '劳', '牢', '捞'],
  'le': ['了', '乐'],
  'lei': ['类', '累', '雷', '泪'],
  'leng': ['冷', '愣'],
  'li': ['里', '理', '力', '立', '利', '离', '例', '历', '丽', '礼', '李'],
  'lia': ['俩'],
  'lian': ['连', '脸', '练', '恋', '联', '帘'],
  'liang': ['两', '亮', '良', '凉', '量', '梁'],
  'liao': ['了', '聊', '料', '疗', '辽'],
  'lie': ['列', '烈', '猎', '裂'],
  'lin': ['林', '临', '邻', '淋'],
  'ling': ['另', '令', '零', '灵', '领', '岭'],
  'liu': ['六', '流', '留', '刘'],
  'long': ['龙', '笼', '隆', '弄'],
  'lou': ['楼', '漏', '露', '搂'],
  'lu': ['路', '录', '陆', '鹿', '绿'],
  'luan': ['乱', '卵'],
  'lun': ['论', '轮', '伦'],
  'luo': ['落', '罗', '洛', '裸'],
  'lv': ['绿', '率', '旅', '律'],
  'm': ['吗', '没', '们', '么', '买', '面', '米'],
  'ma': ['吗', '妈', '马', '码', '骂', '麻'],
  'mai': ['买', '卖', '迈', '麦', '埋'],
  'man': ['满', '慢', '漫', '蛮'],
  'mang': ['忙', '盲', '茫'],
  'mao': ['猫', '毛', '帽', '贸', '冒'],
  'me': ['么'],
  'mei': ['没', '美', '每', '妹', '梅', '煤', '媒'],
  'men': ['们', '门', '闷'],
  'meng': ['梦', '猛', '蒙', '萌'],
  'mi': ['米', '密', '迷', '秘'],
  'mian': ['面', '免', '棉', '眠'],
  'miao': ['秒', '苗', '妙', '描'],
  'mie': ['灭', '蔑'],
  'min': ['民', '敏'],
  'ming': ['明', '名', '命', '鸣'],
  'miu': ['谬'],
  'mo': ['没', '摸', '默', '末', '模', '魔', '磨', '墨'],
  'mou': ['某', '谋'],
  'mu': ['木', '目', '母', '墓', '幕', '慕'],
  'n': ['你', '那', '能', '呢', '男', '南', '拿'],
  'na': ['那', '拿', '哪', '纳'],
  'nai': ['奶', '耐', '奈'],
  'nan': ['难', '男', '南'],
  'nang': ['囊'],
  'nao': ['脑', '闹', '恼'],
  'ne': ['呢'],
  'nei': ['内'],
  'nen': ['嫩'],
  'neng': ['能'],
  'ni': ['你', '泥', '拟', '逆', '尼'],
  'nian': ['年', '念', '粘', '鸟'],
  'niang': ['娘', '酿'],
  'niao': ['鸟', '尿'],
  'nie': ['捏', '聂'],
  'nin': ['您'],
  'ning': ['宁', '凝', '拧'],
  'niu': ['牛', '扭', '纽'],
  'nong': ['弄', '浓', '农'],
  'nu': ['怒', '奴', '努'],
  'nuan': ['暖'],
  'nue': ['虐'],
  'nuo': ['诺', '挪'],
  'nv': ['女'],
  'o': ['哦'],
  'ou': ['偶', '欧', '呕'],
  'p': ['怕', '跑', '平', '片', '朋', '旁', '破'],
  'pa': ['怕', '爬', '趴'],
  'pai': ['派', '拍', '牌', '排'],
  'pan': ['盘', '判', '盼', '攀'],
  'pang': ['旁', '胖'],
  'pao': ['跑', '抛', '泡', '炮'],
  'pei': ['陪', '配', '赔', '佩'],
  'pen': ['喷', '盆'],
  'peng': ['朋', '碰', '棚'],
  'pi': ['皮', '批', '匹', '屁', '疲', '脾'],
  'pian': ['片', '骗', '偏', '篇'],
  'piao': ['票', '飘', '漂'],
  'pie': ['瞥', '撇'],
  'pin': ['品', '拼', '贫', '频'],
  'ping': ['平', '评', '瓶', '凭'],
  'po': ['破', '婆', '迫', '坡', '泼'],
  'pou': ['剖'],
  'pu': ['普', '扑', '铺', '谱'],
  'q': ['去', '起', '七', '钱', '前', '请', '全'],
  'qi': ['起', '气', '七', '期', '其', '奇', '齐', '妻', '骑', '企', '棋', '弃', '汽', '泣'],
  'qia': ['恰', '卡', '掐'],
  'qian': ['前', '钱', '千', '签', '潜', '浅', '欠', '歉', '铅'],
  'qiang': ['强', '枪', '墙', '抢', '腔'],
  'qiao': ['桥', '巧', '敲', '悄', '瞧', '乔', '俏'],
  'qie': ['切', '且', '窃'],
  'qin': ['亲', '勤', '侵', '秦', '琴', '禽'],
  'qing': ['情', '请', '清', '轻', '青', '晴', '庆', '倾'],
  'qiong': ['穷'],
  'qiu': ['球', '求', '秋', '丘'],
  'qu': ['去', '取', '区', '趣', '曲', '屈', '驱'],
  'quan': ['全', '圈', '权', '劝', '泉', '拳'],
  'que': ['却', '确', '缺', '雀'],
  'qun': ['群', '裙'],
  'r': ['人', '热', '日', '让', '认', '然', '如'],
  'ran': ['然', '染', '燃'],
  'rang': ['让', '嚷'],
  'rao': ['绕', '扰', '饶'],
  're': ['热', '惹'],
  'ren': ['人', '任', '认', '忍', '仁'],
  'reng': ['仍', '扔'],
  'ri': ['日'],
  'rong': ['容', '荣', '融', '绒'],
  'rou': ['肉', '柔', '揉'],
  'ru': ['如', '入', '汝', '儒'],
  'ruan': ['软'],
  'rui': ['瑞', '锐'],
  'run': ['润'],
  'ruo': ['若', '弱'],
  's': ['是', '说', '上', '手', '三', '四', '死', '生'],
  'sa': ['撒', '洒', '萨'],
  'sai': ['赛', '塞', '腮'],
  'san': ['三', '散', '伞'],
  'sang': ['丧', '嗓'],
  'sao': ['扫', '嫂', '骚'],
  'se': ['色', '涩'],
  'sen': ['森'],
  'seng': ['僧'],
  'sha': ['杀', '沙', '傻', '纱', '刹'],
  'shai': ['晒'],
  'shan': ['山', '闪', '善', '扇', '衫', '删', '珊'],
  'shang': ['上', '商', '伤', '赏', '尚'],
  'shao': ['少', '烧', '绍', '勺', '哨', '稍'],
  'she': ['社', '设', '射', '蛇', '舍', '舌', '涉'],
  'shei': ['谁'],
  'shen': ['什', '身', '神', '深', '审', '申', '甚', '肾', '伸', '沈'],
  'sheng': ['生', '声', '省', '胜', '剩', '升', '绳', '圣'],
  'shi': ['是', '时', '事', '十', '使', '实', '视', '试', '师', '式', '失', '士', '世', '势', '始', '市', '适', '室', '食', '石', '史', '示', '施', '湿', '诗', '尸', '拾'],
  'shou': ['手', '收', '受', '首', '售', '授', '守', '瘦', '兽'],
  'shu': ['书', '数', '树', '输', '叔', '述', '束', '熟', '鼠', '属', '术', '舒', '疏'],
  'shua': ['刷', '耍'],
  'shuai': ['帅', '摔', '衰'],
  'shuan': ['栓'],
  'shuang': ['双', '霜', '爽'],
  'shui': ['水', '谁', '睡', '税'],
  'shun': ['顺'],
  'shuo': ['说', '烁'],
  'si': ['死', '四', '斯', '司', '私', '思', '丝', '撕', '似'],
  'song': ['送', '松', '宋', '颂', '诵'],
  'sou': ['搜', '嗽'],
  'su': ['速', '素', '苏', '诉', '宿', '俗', '塑'],
  'suan': ['算', '酸'],
  'sui': ['岁', '随', '碎', '虽', '穗'],
  'sun': ['孙', '损', '笋'],
  'suo': ['所', '锁', '缩', '索'],
  't': ['他', '她', '它', '听', '太', '天', '头', '同'],
  'ta': ['他', '她', '它', '踏', '塔'],
  'tai': ['太', '台', '抬', '泰', '态'],
  'tan': ['谈', '探', '坦', '叹', '毯', '滩', '弹', '贪'],
  'tang': ['堂', '唐', '躺', '汤', '糖', '烫', '趟'],
  'tao': ['套', '逃', '桃', '陶', '讨', '淘'],
  'te': ['特'],
  'teng': ['疼', '腾', '藤'],
  'ti': ['体', '提', '题', '替', '踢', '梯', '惕'],
  'tian': ['天', '甜', '田', '填', '添'],
  'tiao': ['条', '跳', '调', '挑'],
  'tie': ['铁', '贴'],
  'ting': ['听', '停', '挺', '厅', '庭'],
  'tong': ['同', '通', '痛', '童', '桶', '统'],
  'tou': ['头', '偷', '透', '投'],
  'tu': ['土', '图', '突', '途', '徒', '涂', '吐', '兔'],
  'tuan': ['团'],
  'tui': ['推', '退', '腿'],
  'tun': ['吞', '屯'],
  'tuo': ['脱', '拖', '托', '驼', '妥'],
  'w': ['我', '为', '问', '无', '五', '万', '玩', '位', '完'],
  'wa': ['哇', '挖', '娃', '瓦', '袜', '晚安', '文案', '外岸'],
  'wai': ['外', '歪'],
  'wan': ['完', '万', '玩', '晚', '碗', '弯', '湾', '丸'],
  'wang': ['往', '王', '望', '网', '忘', '亡', '旺'],
  'wei': ['为', '位', '未', '喂', '味', '微', '围', '危', '委', '卫', '威', '维', '伟', '尾', '伪'],
  'wen': ['问', '文', '闻', '稳', '吻', '温', '蚊'],
  'weng': ['翁'],
  'wo': ['我', '握', '窝', '卧'],
  'wu': ['无', '五', '屋', '物', '舞', '雾', '误', '悟', '污', '伍', '武', '午', '吴'],
  'x': ['想', '下', '先', '小', '写', '些', '笑', '新', '心', '行'],
  'xi': ['西', '洗', '系', '喜', '习', '希', '细', '吸', '席', '戏', '惜', '稀', '息', '悉', '膝', '夕'],
  'xia': ['下', '吓', '夏', '瞎', '峡', '霞'],
  'xian': ['先', '现', '线', '限', '显', '险', '献', '鲜', '闲', '县', '仙', '陷', '羡', '嫌'],
  'xiang': ['想', '向', '象', '像', '响', '项', '香', '乡', '相', '箱', '享', '降'],
  'xiao': ['小', '笑', '消', '校', '效', '销', '晓', '肖', '削', '孝'],
  'xie': ['写', '些', '谢', '鞋', '协', '斜', '血', '歇', '邪', '携'],
  'xin': ['新', '心', '信', '辛', '欣'],
  'xing': ['行', '性', '形', '星', '醒', '姓', '兴', '幸', '刑', '型'],
  'xiong': ['兄', '胸', '雄', '凶', '熊'],
  'xiu': ['修', '休', '秀', '袖', '羞'],
  'xu': ['许', '需', '续', '序', '虚', '须', '徐', '叙', '蓄'],
  'xuan': ['选', '宣', '悬', '旋', '喧'],
  'xue': ['学', '雪', '血', '靴', '穴'],
  'xun': ['寻', '讯', '训', '迅', '询', '循'],
  'y': ['有', '要', '一', '也', '以', '用', '又', '已', '于'],
  'ya': ['呀', '牙', '压', '亚', '鸭', '雅', '押'],
  'yan': ['眼', '言', '演', '严', '验', '颜', '烟', '沿', '盐', '研', '延', '掩', '燕', '厌', '艳', '岩'],
  'yang': ['样', '阳', '洋', '养', '扬', '羊', '氧', '仰', '央', '杨'],
  'yao': ['要', '药', '咬', '腰', '邀', '摇', '妖', '谣', '遥', '姚'],
  'ye': ['也', '夜', '业', '叶', '爷', '野', '页', '液'],
  'yi': ['一', '以', '已', '意', '议', '义', '衣', '移', '依', '医', '易', '椅', '益', '异', '疑', '艺', '忆', '亦', '亿', '役', '译'],
  'yin': ['因', '音', '引', '银', '印', '阴', '隐', '饮', '尹'],
  'ying': ['应', '影', '硬', '英', '迎', '赢', '盈', '营', '婴', '樱', '映', '鹰'],
  'yong': ['用', '勇', '拥', '永', '涌', '庸', '泳'],
  'you': ['有', '又', '由', '右', '友', '游', '优', '油', '幼', '犹', '忧', '尤', '邮', '诱'],
  'yu': ['于', '与', '雨', '语', '遇', '玉', '鱼', '欲', '愈', '狱', '育', '余', '预', '域', '羽', '宇', '渔', '愚', '娱'],
  'yuan': ['远', '员', '元', '院', '圆', '园', '缘', '源', '援', '怨', '袁'],
  'yue': ['月', '越', '约', '乐', '跃', '阅', '岳'],
  'yun': ['云', '运', '晕', '允', '匀', '孕', '韵'],
  'z': ['在', '做', '走', '这', '自', '再', '中', '真', '找', '最'],
  'za': ['杂', '砸', '早安', '专案', '作案'],
  'zai': ['在', '再', '载', '灾', '仔', '栽'],
  'zan': ['赞', '暂', '咱'],
  'zang': ['脏', '葬', '藏'],
  'zao': ['早', '造', '糟', '燥', '澡', '枣', '灶'],
  'ze': ['则', '责', '泽', '择'],
  'zei': ['贼'],
  'zen': ['怎'],
  'zeng': ['增', '赠', '曾'],
  'zha': ['炸', '扎', '眨', '渣', '闸', '诈'],
  'zhai': ['摘', '窄', '债', '宅', '寨'],
  'zhan': ['站', '战', '占', '展', '沾', '斩', '盏', '栈'],
  'zhang': ['张', '长', '涨', '掌', '帐', '仗', '章', '障', '账'],
  'zhao': ['找', '着', '照', '招', '赵', '召', '爪', '罩', '兆'],
  'zhe': ['这', '着', '者', '折', '遮', '哲'],
  'zhen': ['真', '阵', '针', '震', '枕', '镇', '珍', '侦', '贞'],
  'zheng': ['正', '整', '争', '证', '征', '郑', '挣', '政', '症', '睁'],
  'zhi': ['只', '知', '指', '至', '之', '制', '直', '治', '值', '职', '质', '纸', '致', '执', '止', '支', '智', '志', '织', '置', '枝', '植', '滞', '汁', '肢'],
  'zhong': ['中', '种', '重', '众', '钟', '终', '忠', '肿'],
  'zhou': ['周', '州', '洲', '舟', '粥', '皱', '轴'],
  'zhu': ['主', '住', '猪', '竹', '煮', '注', '助', '珠', '祝', '筑', '逐', '朱', '驻'],
  'zhua': ['抓'],
  'zhuai': ['拽'],
  'zhuan': ['转', '专', '赚', '砖', '传'],
  'zhuang': ['装', '撞', '庄', '状', '壮'],
  'zhui': ['追', '坠', '锥'],
  'zhun': ['准'],
  'zhuo': ['桌', '捉', '拙', '卓', '琢'],
  'zi': ['自', '子', '字', '紫', '资', '姿', '滋', '仔'],
  'zong': ['总', '纵', '宗', '棕', '踪'],
  'zou': ['走', '奏', '揍'],
  'zu': ['组', '足', '族', '祖', '租', '阻'],
  'zuan': ['钻'],
  'zui': ['最', '嘴', '醉', '罪'],
  'zun': ['尊', '遵'],
  'zuo': ['做', '坐', '左', '作', '座'],

  // Common phrases (2 chars)
  'nihao': ['你好', '拟好'],
  'women': ['我们', '我门', '无门'],
  'shenme': ['什么', '身么', '婶么'],
  'ziji': ['自己', '自及', '子鸡'],
  'zhidao': ['知道', '指导', '直到', '只道'],
  'xianzai': ['现在', '先在', '显在'],
  'kanyi': ['可以', '看以', '抗议'], // typo handling? keyi
  'keyi': ['可以', '课以', '刻意'],
  'meiyou': ['没有', '梅佑', '煤油'],
  'xihuan': ['喜欢', '洗焕', '稀罕'],
  'yixia': ['一下', '意下', '衣下'],
  'zheyang': ['这样', '遮阳', '这洋'],
  'weishenme': ['为什么'],
  'shihou': ['时候', '事后', '侍候'],
  'pengyou': ['朋友'],
  'duibuqi': ['对不起'],
  'xiexie': ['谢谢', '写写', '歇歇', '斜斜'],
  'zaijian': ['再见', '在建'],
  'wanan': ['晚安'],
  'zaoan': ['早安'],
  'dianhua': ['电话', '点画', '电化'],
  'shouji': ['手机', '收集', '手迹', '首级'],
  'diannao': ['电脑'],
  'gongzuo': ['工作', '躬作'],
  'xuexiao': ['学校'],
  'laoshi': ['老师', '老实', '老是'],
  'xuesheng': ['学生'],
  'yisheng': ['医生', '一生'],
  'yiyuan': ['医院', '意愿', '议院'],
  'shijian': ['时间', '事件', '实践', '世间'],
  'wenti': ['问题', '文体', '闻替'],
  'difang': ['地方', '堤防'],
  'dongxi': ['东西', '动息'],
  'yisi': ['意思', '已死', '疑似'],
  'haochi': ['好吃'],
  'haowan': ['好玩'],
  'gaoxing': ['高兴', '高姓'],
  'kuaile': ['快乐'],
  'mingtian': ['明天'],
  'jintian': ['今天'],
  'zuotian': ['昨天'],
  'shangwu': ['上午', '商务', '尚武'],
  'xiawu': ['下午', '下雾'],
  'wanshang': ['晚上'],
  'zhongwu': ['中午', '中务'],
  'huija': ['回家'], // huijia
  'huijia': ['回家', '会佳'],
  'chifan': ['吃饭', '迟返'],
  'shuijiao': ['睡觉', '水胶', '摔跤'],
  'kaixin': ['开心'],
  'nanguo': ['难过', '南国'],
  'shengqi': ['生气', '升旗', '声气'],
  'faxian': ['发现', '法显', '发线'],
  'gandao': ['感到', '赶到', '干道'],
  'gaosu': ['告诉', '高速'],
  'xiwang': ['希望', '西旺'],
  'juede': ['觉得'],
  'renshi': ['认识', '人士', '人世', '人事'],
  'bangzhu': ['帮助', '帮主'],
  'kaishi': ['开始', '开示'],
  'jieshu': ['结束', '杰书', '借书'],
  'gongsi': ['公司'],
  'jiaotong': ['交通'],
  'qiche': ['汽车', '骑车'],
  'feiji': ['飞机', '费机'],
  'huoche': ['火车', '货车'],
  'gonggongqiche': ['公共汽车'],
  'ditie': ['地铁'],
  'tianqi': ['天气'],
  'xiayu': ['下雨', '夏禹'],
  'guafeng': ['刮风'],
  'taiyang': ['太阳'],
  'yueliang': ['月亮'],
  'xingxing': ['星星', '行行', '猩猩'],
  'chengshi': ['城市', '诚实', '成式'],
  'guojia': ['国家', '过家'],
  'zhongguo': ['中国'],
  'meiguo': ['美国'],
  'yingguo': ['英国'],
  'faguo': ['法国'],
  'deguo': ['德国'],
  'riben': ['日本'],
  'hanguo': ['韩国'],
  // Initials (2 chars)
  'nh': ['你好', '拿好', '那会', '能喝'],
  'wm': ['我们', '外卖', '网民', '误码', '无名', '妩媚'],
  'sm': ['什么', '生命', '说明', '书名', '失眠', '扫码', '神秘', '审美', '私密', '市民'],
  'zj': ['自己', '资金', '专家', '增加', '最近', '之际', '总结', '最佳', '组件', '这就', '再见'],
  'zd': ['知道', '自动', '重点', '战斗', '制度', '直到', '指导', '制定', '针对', '最大'],
  'xz': ['现在', '选择', '限制', '校长', '下载', '协作', '现状', '形状', '寻找', '行政'],
  'ky': ['可以', '科研', '开业', '客运', '考验', '口语', '抗议'],
  'my': ['没有', '美元', '满意', '免疫', '名义', '每月', '民营', '贸易', '蚂蚁', '每一'],
  'xh': ['喜欢', '循环', '协会', '学会', '鲜花', '信号', '型号', '小孩', '消耗', '现货'],
  'yx': ['一下', '游戏', '优秀', '影响', '一线', '有效', '意向', '印象', '运行', '医学'],
  'zy': ['这样', '主要', '重要', '资源', '作业', '专业', '作用', '自由', '注意', '中医'],
  'wsm': ['为什么'],
  'sh': ['是', '什么', '说', '手', '时候', '生活', '上海', '社会', '随后', '适合', '伤害', '身后', '守护', '实惠'],
  'py': ['朋友', '培养', '便宜', '评语', '聘用', '拼音'],
  'dbq': ['对不起'],
  'xx': ['谢谢', '学习', '学校', '信息', '详细', '形象', '小学', '休息', '消息', '小心'],
  'dh': ['电话', '大会', '动画', '导航', '大伙', '订货', '到货'],
  'sj': ['手机', '时间', '设计', '数据', '世界', '事件', '升级', '司机', '实际', '神经', '睡觉'],
  'dn': ['电脑', '当年', '大脑', '对内', '都能'],
  'gz': ['工作', '工资', '关注', '观众', '规则', '改造', '故障', '各种', '构造', '贵州'],
  'ls': ['老师', '历史', '临时', '绿色', '零售', '落实', '零食', '律师', '流水', '流失'],
  'xs': ['学生', '销售', '现实', '显示', '小说', '形式', '享受', '相似', '线索', '新手'],
  'ys': ['医生', '意思', '颜色', '浴室', '优势', '艺术', '意识', '野生', '运输', '预算'],
  'yy': ['医院', '英语', '应用', '音乐', '原因', '意义', '永远', '演员', '拥有', '语音', '预约'],
  'wt': ['问题', '委托', '物体', '舞台', '文体', '梧桐'],
  'df': ['地方', '东方', '答复', '大方', '得分', '得发', '对方'],
  'dx': ['东西', '大学', '对象', '典型', '底线', '短信', '大型', '导向', '地形', '读心'],
  'hc': ['好吃', '火车', '合成', '换车', '豪车', '会场'],
  'hw': ['好玩', '华为', '户外', '货物', '海外', '宏伟'],
  'gx': ['高兴', '关系', '贡献', '高校', '更新', '感谢', '共享', '功效', '故乡', '关心'],
  'kl': ['快乐', '恐龙', '颗粒', '看来', '开立', '考虑'],
  'mt': ['明天', '媒体', '码头', '美图', '马桶', '名堂'],
  'jt': ['今天', '具体', '交通', '家庭', '集团', '镜头', '讲台', '阶梯', '箭头', '机体'],
  'zt': ['昨天', '状态', '主题', '暂停', '整体', '专题', '字体', '侦探', '姿态', '这天'],
  'sw': ['上午', '生物', '商务', '思维', '所谓', '稍微', '死亡', '实物', '守卫', '室外'],
  'xw': ['下午', '新闻', '希望', '行为', '向往', '纤维', '显微', '小屋', '询问', '细微'],
  'ws': ['晚上', '卫生', '无数', '网上', '完善', '卧室', '武术', '为啥', '尾数', '往事'],
  'zw': ['中午', '作为', '植物', '职位', '滋味', '指纹', '作文', '职务', '周围', '中文'],
  'hj': ['回家', '环境', '黄金', '呼叫', '合计', '环节', '痕迹', '户籍', '和解', '寒假'],
  'cf': ['吃饭', '厨房', '出发', '成分', '采访', '处罚', '财富', '重复', '拆分', '触发'],
  'kx': ['开心', '科学', '可惜', '看戏', '苦笑', '快修'],
  'ng': ['难过', '那个', '牛鬼', '能干', '南瓜', '内阁'],
  'sq': ['生气', '社区', '申请', '失去', '授权', '神奇', '诉求', '暑期', '手枪', '省钱'],
  'fx': ['发现', '分析', '方向', '分享', '发行', '风险', '复习', '发型', '费心', '分心'],
  'gd': ['感到', '规定', '滚动', '高度', '各地', '广东', '更多', '固定', '股东', '工地'],
  'gs': ['告诉', '公司', '故事', '高速', '歌手', '公式', '改善', '感受', '工商', '更是'],
  'jd': ['觉得', '简单', '决定', '绝对', '进度', '经典', '解读', '阶段', '酒店', '基地'],
  'rs': ['认识', '人数', '人事', '燃烧', '入手', '染色', '弱势', '日式', '如实', '肉丝'],
  'bz': ['帮助', '标准', '保障', '包装', '步骤', '保证', '不在', '鼻子', '本周', '备注'],
  'ks': ['开始', '考试', '快速', '可视', '口试', '抗生素', '矿石', '扩散', '空手', '客商'],
  'js': ['结束', '技术', '建设', '精神', '角色', '加速', '解释', '计算', '接受', '介绍'],
  'qc': ['汽车', '器材', '清楚', '全场', '去除', '起草', '全程', '清晨', '去处', '球场'],
  'fj': ['飞机', '附近', '房价', '分解', '风景', '否决', '发觉', '附件', '反击', '放假'],
  'ggqc': ['公共汽车'],
  'dt': ['地铁', '动态', '地图', '大厅', '代替', '答题', '当天', '电梯', '得体', '都挺'],
  'tq': ['天气', '提前', '提取', '特权', '同情', '同期', '推起', '听取', '淘气', '台球'],
  'xy': ['下雨', '校园', '学院', '需要', '信用', '效益', '协议', '现有', '响应', '血压'],
  'gf': ['刮风', '广泛', '规范', '官方', '功夫', '股份', '高峰', '国防', '共犯', '过分'],
  'ty': ['太阳', '体育', '同意', '统一', '体验', '通用', '投影', '讨厌', '土壤', '同业'],
  'yl': ['月亮', '医疗', '压力', '原来', '娱乐', '原料', '盈利', '有利', '一类', '引力'],
  'cs': ['城市', '产生', '测试', '参数', '场所', '传送', '厕所', '措施', '出色', '出生'],
  'gj': ['国家', '工具', '国际', '感觉', '根据', '关键', '冠军', '高级', '改进', '攻击'],
  'zg': ['中国', '职工', '资格', '主管', '整个', '诸葛', '做工', '战国', '总共', '足感'],
  'mg': ['美国', '敏感', '蘑菇', '每个', '芒果', '民工', '美感', '免贵', '马褂', '买过'],
  'yg': ['英国', '员工', '严格', '阳光', '一个', '预告', '有关', '用功', '勇敢', '原告'],
  'fg': ['法国', '风格', '法规', '覆盖', '反感', '返工', '分工', '发改', '复工', '腐国'],
  'dg': ['德国', '大哥', '大概', '帝国', '蛋糕', '灯光', '大纲', '渡过', '代购', '电工'],
  'rb': ['日本', '日报', '热榜', '肉包', '染病', '软包', '人本', '入保', '日币', '认别'],
  'hg': ['韩国', '合格', '宏观', '化工', '海关', '回归', '后果', '皇宫', '回顾', '火锅'],
};

type InputMode = 'text' | 'voice';
type ActivePanel = 'none' | 'emoji' | 'more' | 'keyboard';

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Pinyin State
  const [pinyinBuffer, setPinyinBuffer] = useState('');
  const [candidates, setCandidates] = useState<string[]>([]);
  const [isShift, setIsShift] = useState(false);
  const [isCandidateExpanded, setIsCandidateExpanded] = useState(false);

  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  const [useNativeKeyboard, setUseNativeKeyboard] = useState(false);
  // Track physically pressed key for visual feedback
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Keyboard Layout state
  const [keyboardLayout, setKeyboardLayout] = useState<'alpha' | 'numeric' | 'handwriting'>('alpha');

  // Handwriting canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const lastPosRef = useRef<{x: number, y: number} | null>(null);
  const drawingTimeoutRef = useRef<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      setMessages(prev => prev.filter(msg => msg.expiresAt > now));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePanel, isRecording, pinyinBuffer, isCandidateExpanded, keyboardLayout]);

  // Ensure canvas resolution matches display size when switching to handwriting
  useEffect(() => {
    if (keyboardLayout === 'handwriting' && canvasRef.current) {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        if (parent) {
             // Set internal resolution to match displayed size (CSS pixels)
             canvas.width = parent.clientWidth;
             canvas.height = parent.clientHeight;
        }
    }
  }, [keyboardLayout, activePanel]);

  // Update candidates when buffer changes (for Pinyin)
  useEffect(() => {
    if (keyboardLayout === 'handwriting') return; // Do not overwrite handwriting candidates
    
    if (!pinyinBuffer) {
      setCandidates([]);
      setIsCandidateExpanded(false);
      return;
    }
    const lowerBuffer = pinyinBuffer.toLowerCase();
    
    // 1. Raw Pinyin
    const rawCandidate = lowerBuffer;

    let matchedCandidates: string[] = [];

    // 2. Exact Match
    if (PINYIN_MAP[lowerBuffer]) {
      matchedCandidates = [...PINYIN_MAP[lowerBuffer]];
    }

    // 3. Fuzzy Sentence Match (Simple implementation: 1st char of each initial)
    if (matchedCandidates.length === 0 && lowerBuffer.length > 1) {
      let constructedSentence = "";
      let possible = true;
      for (const char of lowerBuffer) {
         const chars = PINYIN_MAP[char];
         if (chars && chars.length > 0) {
            constructedSentence += chars[0];
         } else {
            possible = false; // Cannot construct if a letter is unknown
         }
      }
      if (possible && constructedSentence) {
         matchedCandidates.push(constructedSentence);
      }
    }

    setCandidates([rawCandidate, ...matchedCandidates]);
  }, [pinyinBuffer, keyboardLayout]);

  // Handle Physical Keyboard Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If native keyboard is active, don't interfere
      if (useNativeKeyboard) return;
      // If we are not in keyboard mode, maybe ignore or open it? 
      // For now, let's only capture if panel is 'keyboard' or we are 'none' but want to type
      if (activePanel !== 'keyboard' && activePanel !== 'none') return;
      if (keyboardLayout === 'handwriting') return; // Disable physical typing in handwriting mode

      const key = e.key;
      setPressedKey(key.toUpperCase()); // For visual feedback

      if (key === 'Backspace') {
         if (pinyinBuffer.length > 0) {
           setPinyinBuffer(prev => prev.slice(0, -1));
         } else {
           setInputText(prev => prev.slice(0, -1));
         }
         return;
      }
      
      if (key === 'Enter') {
         e.preventDefault();
         handleSendMessage();
         return;
      }

      if (key === ' ') {
         e.preventDefault();
         if (pinyinBuffer.length > 0 && candidates.length > 0) {
            selectCandidate(candidates[1] || candidates[0]); // Prefer Chinese if avail
         } else {
            setInputText(prev => prev + ' ');
         }
         return;
      }

      if (key.length === 1 && /^[a-zA-Z]$/.test(key) && keyboardLayout === 'alpha') {
         if (activePanel !== 'keyboard') setActivePanel('keyboard');
         setPinyinBuffer(prev => prev + key);
      }
      
      if (key.length === 1 && /^[0-9]$/.test(key) && keyboardLayout === 'numeric') {
          setInputText(prev => prev + key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activePanel, useNativeKeyboard, pinyinBuffer, candidates, keyboardLayout]);

  // Handwriting Functions
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    lastPosRef.current = coords;
    
    if (drawingTimeoutRef.current) {
        window.clearTimeout(drawingTimeoutRef.current);
        drawingTimeoutRef.current = null;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPosRef.current || !canvasRef.current) return;
    e.preventDefault();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const newPos = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPosRef.current = newPos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
    
    // Trigger Gemini recognition
    if (drawingTimeoutRef.current) clearTimeout(drawingTimeoutRef.current);
    drawingTimeoutRef.current = window.setTimeout(async () => {
        if (!canvasRef.current) return;
        
        setIsRecognizing(true);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        try {
            const results = await recognizeHandwrittenCharacter(dataUrl);
            setCandidates(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRecognizing(false);
        }
    }, 800);
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      setCandidates([]);
  };

  // Reset candidates/canvas when switching to handwriting
  useEffect(() => {
      if (keyboardLayout === 'handwriting') {
          clearCanvas();
          setCandidates([]);
      } else {
          setPinyinBuffer('');
      }
  }, [keyboardLayout]);


  const addMessage = (text: string, type: MessageType = 'text', mediaUrl?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      mediaUrl,
      type,
      senderId: 'user',
      timestamp: Date.now(),
      expiresAt: Date.now() + MESSAGE_LIFETIME_MS,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    // Smart Send: if there is pinyin buffer, commit it first
    let textToSend = inputText;
    if (pinyinBuffer.length > 0 && candidates.length > 0) {
       const bestCandidate = candidates[1] || candidates[0]; // Prefer first Chinese match, else raw
       textToSend += bestCandidate;
       setPinyinBuffer('');
       setCandidates([]);
       setInputText(prev => prev + bestCandidate); 
    }

    if (!textToSend.trim()) return;

    addMessage(textToSend);
    setInputText('');
  };

  const selectCandidate = (char: string) => {
    setInputText(prev => prev + char);
    if (keyboardLayout === 'handwriting') {
        clearCanvas(); // Clear after selection for next character
        setCandidates([]);
    } else {
        setPinyinBuffer('');
        setCandidates([]);
        setIsCandidateExpanded(false);
    }
  };

  const handleKeyClick = (key: string) => {
    if (key === 'BACK') {
      if (pinyinBuffer.length > 0) {
        setPinyinBuffer(prev => prev.slice(0, -1));
      } else {
        setInputText(prev => prev.slice(0, -1));
      }
    } else if (key === 'SPACE') {
       if (pinyinBuffer.length > 0 && candidates.length > 0) {
          selectCandidate(candidates[1] || candidates[0]);
       } else {
          setInputText(prev => prev + ' ');
       }
    } else if (key === 'SHIFT') {
      setIsShift(!isShift);
    } else {
      const char = isShift ? key.toUpperCase() : key.toLowerCase();
      if (keyboardLayout === 'alpha') {
        setPinyinBuffer(prev => prev + char);
      } else {
        setInputText(prev => prev + char);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        addMessage('语音消息', 'voice', audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Microphone access failed, using simulation.", err);
      // Fallback to simulation mode UI
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    } else {
      // Simulation fallback
      setTimeout(() => {
         addMessage('语音消息', 'voice', BEEP_AUDIO_DATA); 
      }, 200);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addMessage('图片消息', 'image', url);
    }
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (position) => {
            const { latitude, longitude } = position.coords;
            addMessage(`我的位置: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 'location');
            setActivePanel('none');
         },
         (error) => {
            alert('获取位置失败 (Location Failed)');
            setActivePanel('none');
         }
       );
    } else {
       addMessage('位置信息 (模拟)', 'location');
       setActivePanel('none');
    }
  };

  const playAudio = (id: string, url?: string) => {
    if (!url) return;
    const audio = new Audio(url);
    setPlayingAudioId(id);
    audio.play().catch(e => console.error("Play error", e));
    audio.onended = () => setPlayingAudioId(null);
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'image' && msg.mediaUrl) {
      return (
        <img 
          src={msg.mediaUrl} 
          alt="Shared" 
          className="rounded-lg max-w-[200px] max-h-[200px] object-cover border border-gray-200"
        />
      );
    }
    if (msg.type === 'voice') {
      const isPlaying = playingAudioId === msg.id;
      return (
        <div 
          className="flex items-center gap-2 min-w-[80px] cursor-pointer"
          onClick={() => playAudio(msg.id, msg.mediaUrl)}
        >
          <Wifi className={`w-5 h-5 rotate-90 ${isPlaying ? 'animate-pulse text-green-200' : 'text-gray-500'}`} />
          <span>{isPlaying ? 'Playing...' : 'Voice'}</span>
        </div>
      );
    }
    if (msg.type === 'location') {
       return (
          <div className="flex items-center gap-2 text-blue-600 underline cursor-pointer">
             <MapPin className="w-5 h-5" />
             <span>{msg.text}</span>
          </div>
       );
    }
    return msg.text;
  };

  const keysRow1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const keysRow2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const keysRow3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const numKeysRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const numKeysRow2 = ['-', '/', ':', ';', '(', ')', '¥', '&', '@', '"'];
  const numKeysRow3 = ['.', ',', '?', '!', '\''];

  return (
    <div className="flex flex-col h-full bg-[#a6dcf5]">
      {/* Header */}
      <div className="h-14 bg-[#3b5998] flex items-center justify-between px-4 shadow-md shrink-0 z-10">
        <div className="flex items-center text-white">
          <ChevronLeft className="w-6 h-6 -ml-2" />
          <span className="font-medium text-lg ml-1">阅后即焚</span>
        </div>
        <MoreHorizontal className="w-6 h-6 text-white" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar" onClick={() => setActivePanel('none')}>
        {messages.map((msg) => {
          const timeLeft = Math.max(0, Math.ceil((msg.expiresAt - currentTime) / 1000));
          const user = USERS[msg.senderId];
          const isMe = msg.senderId === 'user';

          return (
            <div key={msg.id} className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center text-white text-sm font-bold mr-3 shrink-0 ${user.color}`}>
                  {user.avatarChar}
                </div>
              )}
              
              <div className="max-w-[70%]">
                 {/* Message Bubble */}
                 <div className={`relative px-3 py-2 rounded-md shadow-sm min-h-[40px] flex items-center
                    ${isMe ? 'bg-[#95ec69]' : 'bg-white'}`}>
                    
                    {/* Triangle pointer */}
                    <div className={`absolute top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent 
                      ${isMe 
                        ? 'right-[-6px] border-l-[8px] border-l-[#95ec69]' 
                        : 'left-[-6px] border-r-[8px] border-r-white'
                      }`}></div>

                    <div className="text-base text-black break-all leading-normal">
                      {renderMessageContent(msg)}
                    </div>
                 </div>
              </div>

              {isMe && (
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center text-white text-sm font-bold ml-3 shrink-0 ${user.color}`}>
                  {user.avatarChar}
                </div>
              )}

              {/* Countdown Timer */}
              <div className={`self-center text-gray-500 font-mono text-xs mx-2 w-4 ${isMe ? 'order-first' : ''}`}>
                 {timeLeft}
              </div>
            </div>
          );
        })}
        <div ref={scrollEndRef} />
      </div>

      {/* Input Area */}
      <div className={`bg-[#f5f5f7] border-t border-gray-300 transition-all duration-200 pb-0`}>
        
        {/* Input Bar */}
        <div className="flex items-center px-2 py-2 gap-2 min-h-[50px]">
          <button 
            onClick={() => {
               setInputMode(prev => prev === 'voice' ? 'text' : 'voice');
               if (activePanel === 'keyboard') setActivePanel('none');
            }}
            className="p-1.5 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-200"
          >
            {inputMode === 'voice' ? <Keyboard className="w-6 h-6" /> : <Wifi className="w-6 h-6 rotate-90" />}
          </button>

          {inputMode === 'voice' ? (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`flex-1 h-10 rounded bg-white border border-gray-300 font-medium text-sm flex items-center justify-center select-none active:bg-gray-200 ${isRecording ? 'bg-gray-200 text-gray-800' : 'text-gray-800'}`}
            >
              {isRecording ? '松开 结束' : '按住 说话'}
            </button>
          ) : (
            <div className="flex-1 relative h-10">
               {useNativeKeyboard ? (
                 <input 
                   ref={inputRef}
                   type="text" 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onFocus={() => setActivePanel('none')} 
                   className="w-full h-full rounded bg-white border border-gray-300 px-3 text-base text-black focus:outline-none focus:border-green-500"
                 />
               ) : (
                  <div 
                    onClick={() => {
                        setActivePanel('keyboard');
                    }}
                    className="w-full h-full rounded bg-white border border-gray-300 px-3 text-base text-black flex items-center overflow-hidden cursor-text"
                  >
                    {inputText}
                    {/* Blinking cursor simulation */}
                    {activePanel === 'keyboard' && (
                        <div className="w-[2px] h-5 bg-blue-500 animate-pulse ml-0.5"></div>
                    )}
                    {/* Placeholder if empty */}
                    {!inputText && !activePanel && <span className="text-gray-400">Message...</span>}
                  </div>
               )}
            </div>
          )}

          <button 
             onClick={() => setActivePanel(activePanel === 'emoji' ? 'none' : 'emoji')}
             className="p-1"
          >
            <Smile className="w-7 h-7 text-gray-600" />
          </button>
          
          <button 
            onClick={() => setActivePanel(activePanel === 'more' ? 'none' : 'more')}
            className="p-1"
          >
            <PlusCircle className="w-7 h-7 text-gray-600" />
          </button>
        </div>

        {/* Panels */}
        <div className="bg-[#f5f5f7] overflow-hidden transition-all duration-300">
           
           {/* Emoji Panel */}
           {activePanel === 'emoji' && (
              <div className="h-64 p-4 grid grid-cols-8 gap-2 overflow-y-auto">
                 {['😀','😂','😅','😊','🥰','😍','😎','😭','😱','😡','👍','👎','👋','🙏','🌹','🎉','🇨🇳'].map(emoji => (
                    <button key={emoji} onClick={() => setInputText(prev => prev + emoji)} className="text-2xl hover:bg-gray-200 rounded">
                       {emoji}
                    </button>
                 ))}
              </div>
           )}

           {/* More Functions Panel */}
           {activePanel === 'more' && (
              <div className="h-64 p-6 grid grid-cols-4 gap-6">
                 <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                       <ImageIcon className="w-7 h-7 text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-500">相册</span>
                 </div>
                 <div onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                       <Camera className="w-7 h-7 text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-500">拍摄</span>
                 </div>
                 <div onClick={handleLocationShare} className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                       <MapPin className="w-7 h-7 text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-500">位置</span>
                 </div>
              </div>
           )}

           {/* Simulated Keyboard */}
           {activePanel === 'keyboard' && !useNativeKeyboard && (
              <div className="bg-[#cfd3d9] pb-4 pt-1 select-none relative h-80">
                 
                 {/* Suggestion Bar */}
                 <div className={`bg-white px-2 shadow-sm mb-2 border-t border-gray-200 flex flex-col transition-all ${isCandidateExpanded ? 'absolute bottom-0 left-0 right-0 z-50 h-80 shadow-2xl rounded-t-lg' : 'h-10'}`}>
                    
                    {/* Collapsed State */}
                    {!isCandidateExpanded && (
                        <div className="h-full flex items-center justify-between">
                            <div className="flex-1 flex items-center space-x-4 overflow-x-auto no-scrollbar">
                                {(keyboardLayout === 'alpha' && pinyinBuffer) && (
                                <span 
                                    onClick={() => selectCandidate(pinyinBuffer)}
                                    className="text-black font-bold border-b-2 border-[#1aad19] px-1 cursor-pointer shrink-0"
                                >
                                    {pinyinBuffer}
                                </span>
                                )}
                                {candidates.map((char, idx) => (
                                <span 
                                    key={idx} 
                                    onClick={() => selectCandidate(char)}
                                    className="text-lg px-2 py-1 active:bg-gray-100 rounded cursor-pointer whitespace-nowrap"
                                >
                                    {char}
                                </span>
                                ))}
                                {!pinyinBuffer && candidates.length === 0 && !isRecognizing && (
                                   <span className="text-gray-400 text-sm ml-2">
                                     {keyboardLayout === 'handwriting' ? '手写区域 (Write Here)' : '中文输入法 (Simulated)'}
                                   </span>
                                )}
                                {isRecognizing && (
                                    <div className="flex items-center text-gray-500 text-sm ml-2">
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Recognizing...
                                    </div>
                                )}
                            </div>
                            {/* Expand Button */}
                            {(pinyinBuffer || candidates.length > 0) && (
                                <button 
                                    onClick={() => setIsCandidateExpanded(true)}
                                    className="p-1 ml-2 text-gray-500 hover:bg-gray-100 rounded bg-white shadow-sm"
                                >
                                    <Plus className="w-5 h-5"/>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Expanded State */}
                    {isCandidateExpanded && (
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between p-2 border-b border-gray-100 bg-gray-50">
                                <span className="text-xs text-gray-500">选择更多</span>
                                <button 
                                    onClick={() => setIsCandidateExpanded(false)}
                                    className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                                >
                                    <ChevronDown className="w-5 h-5"/>
                                </button>
                            </div>
                            <div className="flex-1 grid grid-cols-5 gap-2 p-2 overflow-y-auto">
                                {pinyinBuffer && (
                                <button 
                                    onClick={() => selectCandidate(pinyinBuffer)}
                                    className="text-base p-2 bg-green-50 text-green-700 rounded border border-green-100"
                                >
                                    {pinyinBuffer}
                                </button>
                                )}
                                {candidates.map((char, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => selectCandidate(char)}
                                    className="text-lg p-2 bg-white rounded border border-gray-100 shadow-sm active:bg-gray-50"
                                >
                                    {char}
                                </button>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>

                 {/* KEYBOARD LAYOUTS */}
                 
                 {/* 1. Alpha Layout */}
                 {keyboardLayout === 'alpha' && (
                   <div className="px-1.5 space-y-3">
                      <div className="flex justify-center gap-1.5">
                         {keysRow1.map(k => (
                            <button 
                               key={k} 
                               onMouseDown={() => handleKeyClick(k)}
                               className={`w-[8.5%] h-11 bg-white rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center text-xl font-normal active:bg-[#e4e4e4] active:shadow-none active:translate-y-[1px] transition-all duration-75 ${pressedKey === k ? 'bg-[#e4e4e4] translate-y-[1px] shadow-none' : ''}`}
                            >
                               {isShift ? k : k.toLowerCase()}
                            </button>
                         ))}
                      </div>
                      <div className="flex justify-center gap-1.5 px-4">
                         {keysRow2.map(k => (
                            <button 
                               key={k} 
                               onMouseDown={() => handleKeyClick(k)}
                               className={`w-[8.5%] h-11 bg-white rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center text-xl font-normal active:bg-[#e4e4e4] active:shadow-none active:translate-y-[1px] transition-all duration-75 ${pressedKey === k ? 'bg-[#e4e4e4] translate-y-[1px] shadow-none' : ''}`}
                            >
                               {isShift ? k : k.toLowerCase()}
                            </button>
                         ))}
                      </div>
                      <div className="flex justify-center gap-1.5">
                         <button 
                            onMouseDown={() => handleKeyClick('SHIFT')}
                            className={`w-[13%] h-11 bg-[#acb3bf] rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center active:bg-white active:shadow-none active:translate-y-[1px] ${isShift ? 'bg-white' : ''} ${pressedKey === 'SHIFT' ? 'bg-white shadow-none translate-y-[1px]' : ''}`}
                         >
                            <ArrowUp className={`w-5 h-5 ${isShift ? 'text-black fill-black' : 'text-gray-700'}`} />
                         </button>
                         {keysRow3.map(k => (
                            <button 
                               key={k} 
                               onMouseDown={() => handleKeyClick(k)}
                               className={`w-[8.5%] h-11 bg-white rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center text-xl font-normal active:bg-[#e4e4e4] active:shadow-none active:translate-y-[1px] transition-all duration-75 ${pressedKey === k ? 'bg-[#e4e4e4] translate-y-[1px] shadow-none' : ''}`}
                            >
                               {isShift ? k : k.toLowerCase()}
                            </button>
                         ))}
                         <button 
                            onMouseDown={() => handleKeyClick('BACK')}
                            className={`w-[13%] h-11 bg-[#acb3bf] rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center active:bg-white active:shadow-none active:translate-y-[1px] ${pressedKey === 'BACKSPACE' ? 'bg-white shadow-none translate-y-[1px]' : ''}`}
                         >
                            <X className="w-6 h-6 text-gray-700" />
                         </button>
                      </div>
                   </div>
                 )}

                 {/* 2. Numeric Layout */}
                 {keyboardLayout === 'numeric' && (
                    <div className="px-1.5 space-y-3">
                       <div className="flex justify-center gap-1.5">
                          {numKeysRow1.map(k => (
                             <button 
                                key={k} 
                                onMouseDown={() => handleKeyClick(k)}
                                className={`w-[8.5%] h-11 bg-white rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center text-xl font-normal active:bg-[#e4e4e4] active:shadow-none active:translate-y-[1px]`}
                             >
                                {k}
                             </button>
                          ))}
                       </div>
                       <div className="flex justify-center gap-1.5">
                          {numKeysRow2.map(k => (
                             <button 
                                key={k} 
                                onMouseDown={() => handleKeyClick(k)}
                                className={`w-[8.5%] h-11 bg-white rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center text-xl font-normal active:bg-[#e4e4e4] active:shadow-none active:translate-y-[1px]`}
                             >
                                {k}
                             </button>
                          ))}
                       </div>
                       <div className="flex justify-center gap-1.5">
                           <div className="w-[13%]"></div>
                           {numKeysRow3.map(k => (
                             <button 
                                key={k} 
                                onMouseDown={() => handleKeyClick(k)}
                                className={`w-[17.5%] h-11 bg-white rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center text-xl font-normal active:bg-[#e4e4e4] active:shadow-none active:translate-y-[1px]`}
                             >
                                {k}
                             </button>
                          ))}
                          <button 
                            onMouseDown={() => handleKeyClick('BACK')}
                            className={`w-[13%] h-11 bg-[#acb3bf] rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center active:bg-white active:shadow-none active:translate-y-[1px] ml-auto`}
                         >
                            <X className="w-6 h-6 text-gray-700" />
                         </button>
                       </div>
                    </div>
                 )}

                 {/* 3. Handwriting Layout */}
                 {keyboardLayout === 'handwriting' && (
                     <div className="absolute top-[52px] left-0 right-0 bottom-[64px] bg-[#cfd3d9] px-2">
                         <div className="w-full h-full bg-white rounded-lg overflow-hidden relative border border-gray-300">
                            {/* Rice Grid Background (米字格) */}
                            <div 
                                className="absolute inset-0 pointer-events-none opacity-20"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(to right, #e5e7eb 2px, transparent 2px),
                                        linear-gradient(to bottom, #e5e7eb 2px, transparent 2px),
                                        linear-gradient(45deg, transparent 49.5%, #e5e7eb 49.5%, #e5e7eb 50.5%, transparent 50.5%),
                                        linear-gradient(-45deg, transparent 49.5%, #e5e7eb 49.5%, #e5e7eb 50.5%, transparent 50.5%)
                                    `,
                                    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%'
                                }}
                            >
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-400"></div>
                                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-red-400"></div>
                            </div>

                            <canvas
                                ref={canvasRef}
                                className="w-full h-full touch-none cursor-crosshair relative z-10"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                            {/* Clear Button */}
                            <button 
                                onClick={clearCanvas}
                                className="absolute top-2 right-2 p-2 bg-gray-200/80 rounded-full hover:bg-gray-300 z-20"
                            >
                                <Trash2 className="w-4 h-4 text-gray-600"/>
                            </button>
                         </div>
                     </div>
                 )}

                 {/* Bottom Toolbar */}
                 <div className="flex justify-center gap-1.5 mt-2.5 px-1 absolute bottom-4 left-0 right-0">
                    {/* Toggle Native */}
                    <button 
                       onClick={() => setUseNativeKeyboard(!useNativeKeyboard)}
                       className="w-[12%] h-11 bg-[#acb3bf] rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center active:bg-white active:shadow-none active:translate-y-[1px]"
                    >
                       <Globe className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    {/* Toggle Numeric/Alpha */}
                    <button 
                       onClick={() => setKeyboardLayout(prev => prev === 'alpha' ? 'numeric' : 'alpha')}
                       className="w-[12%] h-11 bg-[#acb3bf] rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center text-sm font-medium text-gray-700 active:bg-white active:shadow-none active:translate-y-[1px]"
                    >
                       {keyboardLayout === 'numeric' ? 'ABC' : '123'}
                    </button>

                     {/* Toggle Handwriting */}
                    <button 
                       onClick={() => setKeyboardLayout(prev => prev === 'handwriting' ? 'alpha' : 'handwriting')}
                       className={`w-[12%] h-11 rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center active:bg-white active:shadow-none active:translate-y-[1px] ${keyboardLayout === 'handwriting' ? 'bg-white' : 'bg-[#acb3bf]'}`}
                    >
                       <Pencil className="w-5 h-5 text-gray-700" />
                    </button>

                    <button 
                       onMouseDown={() => handleKeyClick('SPACE')}
                       className={`flex-1 h-11 bg-white rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center text-sm text-gray-800 active:bg-[#e4e4e4] active:shadow-none active:translate-y-[1px] ${pressedKey === ' ' ? 'bg-[#e4e4e4] shadow-none translate-y-[1px]' : ''}`}
                    >
                       空格
                    </button>
                    <button 
                       onMouseDown={handleSendMessage}
                       className={`w-[22%] h-11 bg-[#007aff] rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.15)] flex items-center justify-center text-white font-medium active:bg-[#0063cf] active:shadow-none active:translate-y-[1px] ${pressedKey === 'ENTER' ? 'bg-[#0063cf] shadow-none translate-y-[1px]' : ''}`}
                    >
                       发送
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
      
      {/* Hidden inputs for File and Camera */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        capture="environment"
        className="hidden" 
      />
    </div>
  );
};

export default ChatScreen;