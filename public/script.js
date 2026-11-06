var records = [];
var boneCount = 0;
var trophyCount = 0; // 奖杯数量
var currentSelectedDate = null;

// 自动分类功能 - 改进版
function autoClassify(text) {
  // 关键词配置：包含关键词和权重
  const keywordConfig = {
    // 学习相关关键词 - 权重较高
    '学习': { category: '学习', weight: 2 },
    '作业': { category: '学习', weight: 2 },
    '考试': { category: '学习', weight: 3 },
    '复习': { category: '学习', weight: 2 },
    '预习': { category: '学习', weight: 2 },
    '上课': { category: '学习', weight: 2 },
    '课程': { category: '学习', weight: 2 },
    '笔记': { category: '学习', weight: 2 },
    '论文': { category: '学习', weight: 3 },
    '实验': { category: '学习', weight: 2 },
    '报告': { category: '学习', weight: 2 },
    '答辩': { category: '学习', weight: 3 },
    '证书': { category: '学习', weight: 2 },
    '技能': { category: '学习', weight: 2 },
    '培训': { category: '学习', weight: 2 },
    '单词': { category: '学习', weight: 1 },
    '阅读': { category: '学习', weight: 1 },
    '听力': { category: '学习', weight: 1 },
    '写作': { category: '学习', weight: 1 },
    '口语': { category: '学习', weight: 1 },
    '六级': { category: '学习', weight: 3 },
    '四级': { category: '学习', weight: 3 },
    '考研': { category: '学习', weight: 3 },
    '雅思': { category: '学习', weight: 3 },
    '托福': { category: '学习', weight: 3 },
    '竞赛': { category: '学习', weight: 2 },
    '项目': { category: '学习', weight: 2 },
    '研究': { category: '学习', weight: 2 },
    '算法': { category: '学习', weight: 2 },
    '编程': { category: '学习', weight: 2 },
    '代码': { category: '学习', weight: 2 },
    '设计': { category: '学习', weight: 2 },
    '测试': { category: '学习', weight: 2 },
    
    // 生活相关关键词
    '生活': { category: '生活', weight: 1 },
    '吃饭': { category: '生活', weight: 1 },
    '睡觉': { category: '生活', weight: 1 },
    '起床': { category: '生活', weight: 1 },
    '洗漱': { category: '生活', weight: 1 },
    '洗衣': { category: '生活', weight: 1 },
    '做饭': { category: '生活', weight: 1 },
    '购物': { category: '生活', weight: 1 },
    '超市': { category: '生活', weight: 1 },
    '外卖': { category: '生活', weight: 1 },
    '电影': { category: '生活', weight: 1 },
    '游戏': { category: '生活', weight: 1 },
    '运动': { category: '生活', weight: 1 },
    '健身': { category: '生活', weight: 1 },
    '跑步': { category: '生活', weight: 1 },
    '散步': { category: '生活', weight: 1 },
    '旅游': { category: '生活', weight: 1 },
    '出行': { category: '生活', weight: 1 },
    '交通': { category: '生活', weight: 1 },
    '回家': { category: '生活', weight: 1 },
    '父母': { category: '生活', weight: 1 },
    '家人': { category: '生活', weight: 1 },
    '朋友': { category: '生活', weight: 1 },
    '同学': { category: '生活', weight: 1 },
    '恋爱': { category: '生活', weight: 1 },
    '旅游': { category: '生活', weight: 1 },
    '假期': { category: '生活', weight: 1 },
    '周末': { category: '生活', weight: 1 },
    '节日': { category: '生活', weight: 1 },
    '生日': { category: '生活', weight: 1 },
    
    // 碎碎念相关关键词
    '碎碎念': { category: '碎碎念', weight: 2 },
    '心情': { category: '碎碎念', weight: 1 },
    '感受': { category: '碎碎念', weight: 1 },
    '情绪': { category: '碎碎念', weight: 1 },
    '开心': { category: '碎碎念', weight: 1 },
    '难过': { category: '碎碎念', weight: 1 },
    '悲伤': { category: '碎碎念', weight: 1 },
    '快乐': { category: '碎碎念', weight: 1 },
    '兴奋': { category: '碎碎念', weight: 1 },
    '焦虑': { category: '碎碎念', weight: 1 },
    '烦躁': { category: '碎碎念', weight: 1 },
    '平静': { category: '碎碎念', weight: 1 },
    '疲惫': { category: '碎碎念', weight: 1 },
    '无聊': { category: '碎碎念', weight: 1 },
    '充实': { category: '碎碎念', weight: 1 },
    '满足': { category: '碎碎念', weight: 1 },
    '遗憾': { category: '碎碎念', weight: 1 },
    '后悔': { category: '碎碎念', weight: 1 },
    '委屈': { category: '碎碎念', weight: 1 },
    '愤怒': { category: '碎碎念', weight: 1 },
    '恐惧': { category: '碎碎念', weight: 1 },
    '担心': { category: '碎碎念', weight: 1 },
    '想念': { category: '碎碎念', weight: 1 },
    '期待': { category: '碎碎念', weight: 1 },
    '失望': { category: '碎碎念', weight: 1 },
    
    // 活动相关关键词
    '活动': { category: '活动', weight: 2 },
    '会议': { category: '活动', weight: 2 },
    '讲座': { category: '活动', weight: 2 },
    '演讲': { category: '活动', weight: 2 },
    '演出': { category: '活动', weight: 1 },
    '比赛': { category: '活动', weight: 2 },
    '竞赛': { category: '活动', weight: 2 },
    '志愿者': { category: '活动', weight: 2 },
    '社团': { category: '活动', weight: 2 },
    '组织': { category: '活动', weight: 1 },
    '策划': { category: '活动', weight: 2 },
    '布置': { category: '活动', weight: 1 },
    '参与': { category: '活动', weight: 1 },
    '主持': { category: '活动', weight: 2 },
    '表演': { category: '活动', weight: 1 },
    '展示': { category: '活动', weight: 1 },
    '展览': { category: '活动', weight: 1 },
    '参观': { category: '活动', weight: 1 },
    '访问': { category: '活动', weight: 1 },
    '交流': { category: '活动', weight: 1 },
    '合作': { category: '活动', weight: 1 },
    '团建': { category: '活动', weight: 2 },
    '聚会': { category: '活动', weight: 1 },
    '派对': { category: '活动', weight: 1 },
    '庆典': { category: '活动', weight: 2 },
    '仪式': { category: '活动', weight: 2 },
    '典礼': { category: '活动', weight: 2 },
    '开幕式': { category: '活动', weight: 3 },
    '闭幕式': { category: '活动', weight: 3 },
    '答辩': { category: '活动', weight: 2 },
    '汇报': { category: '活动', weight: 2 },
    '总结': { category: '活动', weight: 2 }
  };
  
  // 初始化分数
  const scores = {
    '学习': 0,
    '生活': 0,
    '碎碎念': 0,
    '活动': 0
  };

  // 转换为小写进行匹配
  const lowerText = text.toLowerCase();
  
  // 统计各类别得分
  for (const [keyword, config] of Object.entries(keywordConfig)) {
    const lowerKeyword = keyword.toLowerCase();
    const count = (lowerText.match(new RegExp(lowerKeyword, 'g')) || []).length;
    scores[config.category] += count * config.weight;
  }
  
  // 计算总得分
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  // 如果没有匹配到关键词，根据文本内容进行智能判断
  if (totalScore === 0) {
    const textLength = text.length;
    // 如果文本较长且包含专业术语，可能是学习
    if (textLength > 30 && /[专业|研究|分析|设计|实现|开发|算法|编程|代码]/.test(lowerText)) {
      return '学习';
    }
    // 如果文本包含时间、地点等信息，可能是活动
    if (/[今天|明天|后天|昨天|上周|下周|上午|下午|晚上|点|分|在|于|地点|地址|时间]/.test(lowerText)) {
      return '活动';
    }
    // 默认返回生活
    return '生活';
  }
  
  // 找出得分最高的类别
  let maxScore = 0;
  let bestCategory = '生活';
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

// 心情自动识别功能
function autoDetectMood(text) {
  const lowerText = text.toLowerCase();

  // 心情关键词映射
  const moodKeywords = {
    '开心': ['开心', '快乐', '高兴', '愉快', '兴奋', '激动', '幸福', '满足', '充实', '成就', '骄傲', '自豪', '感动', '温暖'],
    '平静': ['一般', '普通', '平常', '平淡', '正常', '平静'],
    '难过': ['难过', '悲伤', '伤心', '痛苦', '失望', '沮丧', '低落', '郁闷', '委屈'],
    '焦虑': ['焦虑', '紧张', '压力', '担忧', '害怕', '恐惧', '烦躁'],
    '专注': ['专注', '认真', '投入', '全神贯注', '专心致志']
  };

  // 检查文本中包含的心情关键词
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return mood;
      }
    }
  }

  // 默认返回平静
  return '平静';
}

// 性质识别功能：区分碎碎念和里程碑
function detectRecordType(text) {
  // 里程碑关键词
  const milestoneKeywords = ['成功', '完成', '实现', '达成', '获得', '拿到', '通过', '考上', '录取', '毕业', '晋升', '获奖', '冠军', '亚军', '季军', '一等奖', '二等奖', '三等奖', '优秀', '杰出', '卓越', '突破', '创新', '里程碑', '重要', '关键', '纪念', '庆祝', '庆典', '典礼', '仪式', '首次', '第一', '唯一', '最高', '最好', '最大', '最重要', '最难忘', '最开心', '最感动', '最骄傲', '最自豪'];
  
  // 碎碎念特征：日常琐事，没有明确的成就或重要事件
  const dailyKeywords = ['今天', '现在',  '刚才', '最近', '吃饭', '睡觉', '起床', '洗漱', '洗衣', '做饭', '购物', '超市', '外卖', '电影', '游戏', '运动', '健身', '跑步', '散步', '旅游', '出行', '交通', '回家', '父母', '家人', '朋友', '同学', '恋爱', '心情', '感受', '情绪', '健康', '生病', '医院', '医生', '药物', '睡眠', '休息', '娱乐', '放松', '假期', '周末', '节日', '生日'];
  
  const lowerText = text.toLowerCase();
  
  // 检查是否包含里程碑关键词
  for (const keyword of milestoneKeywords) {
    if (lowerText.includes(keyword)) {
      return 'milestone'; // 里程碑
    }
  }
  
  // 检查是否包含多个日常关键词
  let dailyCount = 0;
  for (const keyword of dailyKeywords) {
    if (lowerText.includes(keyword)) {
      dailyCount++;
    }
  }
  
  if (dailyCount >= 2 || text.length < 20) {
    return 'daily'; // 碎碎念
  }
  
  return 'daily'; // 默认碎碎念
}

// 关键词提取功能
function extractTags(text) {
  // 合并所有关键词
  const allKeywords = [
    ...['学习', '作业', '考试', '复习', '预习', '上课', '课程', '笔记', '论文', '实验', '报告', '答辩', '证书', '技能', '培训', '单词', '阅读', '听力', '写作', '口语', '六级', '四级', '考研', '雅思', '托福', '竞赛', '项目', '研究', '算法', '编程', '代码', '设计'],
    ...['生活', '吃饭', '睡觉', '起床', '洗漱', '洗衣', '做饭', '购物', '超市', '外卖', '电影', '游戏', '运动', '健身', '跑步', '散步', '旅游', '出行', '交通', '回家', '父母', '家人', '朋友', '同学', '恋爱', '心情', '感受', '情绪', '健康', '生病', '医院', '医生', '药物', '睡眠', '休息', '娱乐', '放松', '假期', '周末', '节日', '生日'],
    ...['活动', '会议', '讲座', '演讲', '演出', '比赛', '竞赛', '志愿者', '社团', '组织', '策划', '布置', '参与', '主持', '表演', '展示', '展览', '参观', '访问', '交流', '合作', '团建', '聚会', '派对', '庆典', '仪式', '典礼', '开幕式', '闭幕式', '答辩', '汇报', '总结']
  ];
  
  const lowerText = text.toLowerCase();
  const tags = [];
  
  // 提取关键词
  for (const keyword of allKeywords) {
    if (lowerText.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword);
      if (tags.length >= 5) break; // 最多提取5个关键词
    }
  }
  
  return tags;
}

// 打卡记录检测功能
function detectCheckIn(text) {
  // 打卡相关关键词 - 移除过于笼统的"学习"，只保留具体关键词
  const checkInKeywords = [
    '背单词', '单词', '打卡', '签到', '每日', '坚持', '连续', '第几天', '天数', '阅读', '听力', '写作', '口语', 
    '六级', '四级', '考研', '雅思', '托福', '竞赛', '项目', '研究', '算法', '编程', '代码', '设计', 
    '运动', '健身', '跑步', '散步', '瑜伽', '冥想', '日记', '画画', '练字', '钢琴', '吉他', '唱歌', '跳舞', 
    '书法', '绘画', '手工', '复习', '预习', '上课', '课程', '笔记', '论文', '实验', '报告', '答辩', '证书', '技能', '培训'
  ];
  
  // 排除的笼统关键词
  const excludedTopics = ['学习'];
  
  const lowerText = text.toLowerCase();
  
  // 检查是否包含打卡关键词
  for (const keyword of checkInKeywords) {
    if (lowerText.includes(keyword)) {
      // 提取具体打卡主题
      let checkInTopic = 'default';
      
      // 具体打卡主题检测 - 只识别具体的关键词，不识别笼统的"学习"
      if (lowerText.includes('背单词') || lowerText.includes('单词')) {
        checkInTopic = '单词';
      } else if (lowerText.includes('阅读')) {
        checkInTopic = '阅读';
      } else if (lowerText.includes('听力')) {
        checkInTopic = '听力';
      } else if (lowerText.includes('写作')) {
        checkInTopic = '写作';
      } else if (lowerText.includes('口语')) {
        checkInTopic = '口语';
      } else if (lowerText.includes('运动') || lowerText.includes('健身') || lowerText.includes('跑步') || lowerText.includes('散步') || lowerText.includes('瑜伽') || lowerText.includes('冥想')) {
        checkInTopic = '运动';
      } else if (lowerText.includes('编程') || lowerText.includes('代码') || lowerText.includes('设计') || lowerText.includes('算法')) {
        checkInTopic = '编程';
      } else if (lowerText.includes('画画') || lowerText.includes('绘画') || lowerText.includes('手工') || lowerText.includes('书法') || lowerText.includes('练字')) {
        checkInTopic = '艺术';
      } else if (lowerText.includes('钢琴') || lowerText.includes('吉他') || lowerText.includes('唱歌') || lowerText.includes('跳舞')) {
        checkInTopic = '音乐';
      } else if (lowerText.includes('日记')) {
        checkInTopic = '日记';
      } else if (lowerText.includes('六级') || lowerText.includes('四级') || lowerText.includes('考研') || lowerText.includes('雅思') || lowerText.includes('托福')) {
        checkInTopic = '考试';
      }
      
      // 只有识别到具体主题才标记为打卡记录
      if (checkInTopic !== 'default' && !excludedTopics.includes(checkInTopic)) {
        return {
          isCheckIn: true,
          topic: checkInTopic
        };
      }
    }
  }
  
  return {
    isCheckIn: false,
    topic: 'default'
  };
}

// 统计打卡记录
function getCheckInStats() {
  const stats = {};
  
  records.forEach(record => {
    if (record.checkIn && record.checkIn.isCheckIn) {
      const topic = record.checkIn.topic;
      if (!stats[topic]) {
        stats[topic] = [];
      }
      stats[topic].push(record.date);
    }
  });
  
  // 计算连续打卡天数
  for (const topic in stats) {
    const dates = stats[topic].sort();
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i-1]);
      const currDate = new Date(dates[i]);
      const diffTime = currDate - prevDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    
    stats[topic] = {
      total: dates.length,
      maxStreak: maxStreak,
      dates: dates
    };
  }
  
  return stats;
}

// 更新骨头数量显示
function updateBoneCount() {
  const boneCountElement = document.getElementById('boneCount');
  if (boneCountElement) {
    boneCountElement.textContent = boneCount;
  }
}

// 更新奖杯数量显示
function updateTrophyCount() {
  const trophyCountElement = document.getElementById('trophyCount');
  if (trophyCountElement) {
    trophyCountElement.textContent = trophyCount;
  }
}

// 搜索功能
function searchRecords(keyword) {
  if (!keyword || keyword.trim() === '') {
    return records;
  }
  
  const lowerKeyword = keyword.toLowerCase();
  return records.filter(record => {
    // 搜索文本内容
    if (record.text.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // 搜索分类
    if (record.category.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // 搜索心情
    if (record.mood.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // 搜索日期
    if (record.date.includes(lowerKeyword)) {
      return true;
    }
    
    // 搜索标签
    if (record.tags && record.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))) {
      return true;
    }
    
    // 搜索打卡主题
    if (record.checkIn && record.checkIn.isCheckIn && record.checkIn.topic.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    return false;
  });
}

// 渲染搜索结果
function renderSearchResults(results, keyword) {
  let html = '<div class="search-results-container">';
  
  if (results.length === 0) {
    html += '<div class="text-center py-5 text-white">' +
      '<i class="fas fa-search fa-5x text-white-50 mb-3"></i>' +
      '<h3>未找到相关记录</h3>' +
      '<p class="text-white-50">换个关键词试试吧</p>' +
      '</div>';
  } else {
    html += '<h3 class="mb-4"><i class="fas fa-search me-2"></i>搜索结果 <span class="text-warning">(' + results.length + ')</span></h3>';
    
    // 按日期分组显示
    const groupedResults = {};
    results.forEach(record => {
      const date = record.date;
      if (!groupedResults[date]) {
        groupedResults[date] = [];
      }
      groupedResults[date].push(record);
    });
    
    // 按日期倒序排序
    const sortedDates = Object.keys(groupedResults).sort((a, b) => new Date(b) - new Date(a));
    
    sortedDates.forEach(date => {
      const dateResults = groupedResults[date];
      html += '<div class="search-result-date-group mb-5">';
      html += '<h4 class="text-success mb-3"><i class="fas fa-calendar-alt me-2"></i>' + date + '</h4>';
      
      dateResults.forEach(record => {
        // 心情图标映射
        const moodIcons = {
          '开心': '😊',
          '平静': '😐',
          '难过': '😢',
          '兴奋': '🎉',
          '焦虑': '😰'
        };
        
        // 分类颜色映射
    const categoryColors = {
      '学习': 'bg-learning',
      '生活': 'bg-life',
      '活动': 'bg-event',
      '碎碎念': 'bg-mood'
    };
        
        html += '<div class="timeline-leaf mb-3">';
        html += '<div class="leaf-main-row">';
        html += '<span class="mood-icon">' + (moodIcons[record.mood] || '😊') + '</span>';
        html += '<span class="badge ' + categoryColors[record.category] + ' text-white">' + record.category + '</span>';
        html += '<div class="leaf-text-content">' + record.text + '</div>';
        // 显示用户选择的具体时间，如果没有则使用timestamp
        html += '<span class="leaf-time"><i class="fas fa-clock time-icon"></i>' + (record.time || new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })) + '</span>';

        if (record.type === 'milestone') {
          html += '<span class="badge bg-primary text-white ms-2">里程碑</span>';
        }
        html += '</div>';
        html += '<div class="leaf-header d-none"></div>'; // 保留空的header，防止样式问题
        if (record.hasImage) {
          html += '<div class="leaf-image">';
          html += '<img src="' + record.image + '" alt="记录图片" class="img-fluid rounded">';
          html += '</div>';
        }
        html += '</div>';
      });
      
      html += '</div>';
    });
  }
  
  html += '</div>';
  return html;
}

// 页面切换函数
function showPage(pageName) {
  console.log('切换到页面:', pageName);
  var app = document.getElementById('app');
  var forestScene = document.getElementById('forestScene');
  
  if (pageName === 'timeline') {
    forestScene.style.display = 'block';
    
    // 计算有记录的日期数
    const recordsByDate = {};
    records.forEach(record => {
      if (!recordsByDate[record.date]) {
        recordsByDate[record.date] = [];
      }
      recordsByDate[record.date].push(record);
    });
    const flowerCount = Object.keys(recordsByDate).length;
    
    app.innerHTML = '<div class="text-center py-4 text-white">' +
      '<h3><i class="fas fa-gamepad me-2"></i> 森林探索进度</h3>' +
      '<p class="text-white-50">' +
      '已收集 <span class="text-warning fw-bold">' + flowerCount + '</span> 个记忆花朵<br>' +
      '已获得 <span class="text-warning fw-bold">' + boneCount + '</span> 根骨头<br>' +
      '点击花朵查看那天的故事' +
      '</p>' +
      '<button class="btn btn-success mt-3" onclick="showPage(\'add\')">' +
      '<i class="fas fa-plus me-2"></i>添加新记录' +
      '</button>' +
      '</div>';
    
    // 更新记录花朵显示
    updateRecordFlowers();
    // 更新年份旗帜
    updateYearFlags();
    // 默认滚动到最新记录
    scrollForestToLatest();
  } else if (pageName === 'add') {
    // 显示弹窗
    showAddRecordModal();
  } else if (pageName === 'checkin') {
    // 显示打卡统计页面
    forestScene.style.display = 'none';
    
    // 获取打卡统计数据
    const checkInStats = getCheckInStats();
    
    // 构建打卡统计页面HTML
    let checkInHtml = '<div class="search-container">' +
      '<h3><i class="fas fa-calendar-check me-2"></i>打卡统计</h3>' +
      '<div class="checkin-stats-container">';
    
    if (Object.keys(checkInStats).length === 0) {
      checkInHtml += '<div class="text-center py-5 text-white">' +
        '<div class="display-1 mb-3">📅</div>' +
        '<h4 class="text-white">还没有打卡记录</h4>' +
        '<p class="text-white-50">开始添加记录并打卡吧！</p>' +
        '<button class="btn btn-success mt-3" onclick="showPage(\'add\')">' +
        '<i class="fas fa-plus me-2"></i>添加新记录' +
        '</button>' +
        '</div>';
    } else {
      // 总打卡统计
      let totalCheckIns = 0;
      let totalMaxStreak = 0;
      for (const topic in checkInStats) {
        totalCheckIns += checkInStats[topic].total;
        totalMaxStreak = Math.max(totalMaxStreak, checkInStats[topic].maxStreak);
      }
      
      checkInHtml += '<div class="checkin-summary mb-4 p-3 bg-dark bg-opacity-50 rounded">' +
        '<h4 class="text-white mb-2">总览</h4>' +
        '<div class="d-flex flex-wrap gap-4">' +
        '<div class="checkin-summary-item">' +
        '<div class="text-warning fw-bold">' + totalCheckIns + '</div>' +
        '<div class="text-white-50 small">总打卡次数</div>' +
        '</div>' +
        '<div class="checkin-summary-item">' +
        '<div class="text-primary fw-bold">' + Object.keys(checkInStats).length + '</div>' +
        '<div class="text-white-50 small">打卡类别</div>' +
        '</div>' +
        '<div class="checkin-summary-item">' +
        '<div class="text-success fw-bold">' + totalMaxStreak + '</div>' +
        '<div class="text-white-50 small">最长连续打卡</div>' +
        '</div>' +
        '</div>' +
        '</div>';
      
      // 各主题打卡详情
      for (const topic in checkInStats) {
        const stats = checkInStats[topic];
        // 将日期数组转换为逗号分隔的字符串，安全传递给函数
        const datesStr = stats.dates.join(',');
        checkInHtml += '<div class="checkin-topic mb-4 p-3 bg-dark bg-opacity-50 rounded">' +
          '<h4 class="text-white mb-2"><i class="fas fa-tag me-2"></i>' + topic + '</h4>' +
          '<div class="d-flex flex-wrap gap-4 mb-3">' +
          // 总打卡次数卡片，添加点击事件显示打卡日期弹窗
          '<div class="checkin-topic-item cursor-pointer" onclick="showCheckInDates(\'' + datesStr + '\', \'' + topic + '\')">' +
          '<div class="text-success fw-bold">' + stats.total + '</div>' +
          '<div class="text-white-50 small">总打卡次数</div>' +
          '</div>' +
          '<div class="checkin-topic-item">' +
          '<div class="text-primary fw-bold">' + stats.maxStreak + '</div>' +
          '<div class="text-white-50 small">最长连续打卡</div>' +
          '</div>' +
          '</div>' +
          '</div>';
      }
    }
    
    checkInHtml += '</div></div>';
    app.innerHTML = checkInHtml;
  } else if (pageName === 'search') {
    forestScene.style.display = 'none';
    app.innerHTML = '<div class="search-container">' +
      '<h3><i class="fas fa-search me-2"></i>搜索记录</h3>' +
      '<div class="input-group mb-4">' +
      '<input type="text" id="searchInput" class="form-control" placeholder="输入关键词搜索，支持内容、分类、日期、标签等" autocomplete="off">' +
      '<button class="btn btn-success" onclick="performSearch()">' +
      '<i class="fas fa-search"></i> 搜索' +
      '</button>' +
      '</div>' +
      '<div id="searchResults"></div>' +
      '</div>';
    
    // 搜索输入框事件监听
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    // 初始显示所有记录
    searchResults.innerHTML = renderSearchResults(records, '');
    
    // 实时搜索
    searchInput.addEventListener('input', function() {
      performSearch();
    });
    
    // 回车键搜索
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    
    window.performSearch = function() {
      const keyword = searchInput.value;
      const results = searchRecords(keyword);
      searchResults.innerHTML = renderSearchResults(results, keyword);
    };
  } else if (pageName === 'kb') {
    forestScene.style.display = 'none';
    app.innerHTML =
      '<div class="kb-container">' +
        '<div class="kb-header d-flex align-items-center justify-content-between mb-3">' +
          '<h3 class="text-white mb-0"><i class="fas fa-book-open me-2 text-warning"></i>成长知识库</h3>' +
          '<span id="kbHealth" class="kb-health-badge"><i class="fas fa-circle-notch fa-spin"></i> 检测向量库…</span>' +
        '</div>' +
        '<p class="text-white-50 small mb-4">上传保研通知、奖学金文件、培养方案等文档，AI 只会基于你上传的内容回答，并附带原文引用。</p>' +

        '<div class="row g-4">' +
          // 左侧：文档管理
          '<div class="col-lg-5">' +
            '<div class="kb-card p-3 mb-3">' +
              '<h5 class="text-white mb-3"><i class="fas fa-cloud-upload-alt me-2"></i>上传文档</h5>' +
              '<div id="kbDropZone" class="kb-drop-zone">' +
                '<i class="fas fa-file-upload fa-2x mb-2 text-white-50"></i>' +
                '<p class="text-white-50 mb-1">点击或拖拽文件到此处</p>' +
                '<p class="text-white-50 small mb-0">支持 TXT / MD / CSV / PDF / DOCX，单文件 ≤ 50MB</p>' +
                '<input type="file" id="kbFileInput" class="d-none" accept=".txt,.md,.csv,.pdf,.docx">' +
              '</div>' +
              '<div id="kbUploadStatus" class="mt-2 small"></div>' +
            '</div>' +
            '<div class="kb-card p-3">' +
              '<h5 class="text-white mb-3"><i class="fas fa-folder-open me-2"></i>我的文档 <span id="kbDocCount" class="badge bg-secondary ms-1">0</span></h5>' +
              '<div id="kbDocList"><div class="text-white-50 small text-center py-3">加载中…</div></div>' +
            '</div>' +
          '</div>' +

          // 右侧：问答
          '<div class="col-lg-7">' +
            '<div class="kb-card p-3 h-100 d-flex flex-column">' +
              '<h5 class="text-white mb-3"><i class="fas fa-comments me-2"></i>知识库问答</h5>' +
              '<div class="input-group mb-3">' +
                '<input type="text" id="kbQuestion" class="form-control" placeholder="例如：保研对绩点和竞赛有什么要求？" autocomplete="off">' +
                '<button class="btn btn-warning" id="kbAskBtn"><i class="fas fa-paper-plane"></i> 提问</button>' +
              '</div>' +
              '<div id="kbAnswerBox" class="kb-answer-box flex-grow-1">' +
                '<div class="text-white-50 text-center py-5"><i class="fas fa-lightbulb fa-2x mb-2"></i><br>上传文档后，在这里提问即可获得带引用的回答</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // 健康检查
    apiFetch('/api/kb/health').then((h) => {
      const el = document.getElementById('kbHealth');
      if (!el) return;
      if (h.ok) {
        el.className = 'kb-health-badge kb-health-ok';
        el.innerHTML = '<i class="fas fa-circle"></i> 向量库已连接';
      } else {
        el.className = 'kb-health-badge kb-health-err';
        el.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 向量库未连接';
      }
    }).catch(() => {
      const el = document.getElementById('kbHealth');
      if (el) { el.className = 'kb-health-badge kb-health-err'; el.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 向量库未连接'; }
    });

    kbInitPage();
  } else if (pageName === 'users') {
    forestScene.style.display = 'none';
    app.innerHTML =
      '<div class="kb-container">' +
        '<div class="kb-header d-flex align-items-center justify-content-between mb-3">' +
          '<h3 class="text-white mb-0"><i class="fas fa-users-cog me-2 text-primary"></i>用户管理</h3>' +
          '<span id="userCount" class="badge bg-primary">0 位用户</span>' +
        '</div>' +
        '<p class="text-white-50 small mb-4">查看所有注册用户的基本信息与数据统计，可删除用户（会级联清理其记录、知识文档与向量切片）。</p>' +
        '<div class="kb-card p-3">' +
          '<div class="table-responsive">' +
            '<table class="table table-dark table-hover align-middle mb-0">' +
              '<thead><tr>' +
                '<th>ID</th><th>用户名</th><th>注册时间</th>' +
                '<th class="text-center">记录数</th><th class="text-center">知识文档</th>' +
                '<th class="text-center">操作</th>' +
              '</tr></thead>' +
              '<tbody id="userTableBody"><tr><td colspan="6" class="text-center text-white-50 py-4">加载中…</td></tr></tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>';
    usersLoad();
  }
}

// 删除确认相关函数
function showDeleteConfirm(recordId) {
  // 找到要删除的记录
  const record = records.find(r => r.id === recordId);
  if (!record) return;
  
  // 创建删除确认弹窗
  const overlay = document.getElementById('deleteConfirmOverlay');
  if (!overlay) return;
  
  // 构建弹窗内容
  let previewHTML = '';
  if (record.hasImage && record.image) {
    previewHTML = '<img src="' + record.image + '" alt="记录图片" class="img-fluid rounded mb-3" style="max-height: 150px;">';
  }
  
  overlay.innerHTML = '<div class="delete-confirm-dialog">' +
    '<div class="delete-warning-icon">⚠️</div>' +
    '<h4 class="text-white mb-3">确认删除这条记录？</h4>' +
    '<div class="delete-record-preview">' +
    previewHTML +
    '<div class="preview-top-row">' +
    '<div class="preview-category badge bg-' + getCategoryColor(record.category) + ' text-white">' + record.category + '</div>' +
    '<div class="preview-text">' + record.text + '</div>' +
    '</div>' +
    '<div class="preview-date"><i class="fas fa-calendar-alt"></i> ' + record.date + ' ' + (record.time || '00:00') + '</div>' +
    '</div>' +
    '<div class="delete-confirm-buttons">' +
    '<button class="btn btn-cancel" onclick="cancelDelete()"><i class="fas fa-times"></i> 取消</button>' +
    '<button class="btn btn-danger" onclick="confirmDelete(' + recordId + ')"><i class="fas fa-trash-alt"></i> 删除</button>' +
    '</div>' +
    '</div>';
  
  overlay.style.display = 'flex';
}

// 获取分类颜色
function getCategoryColor(category) {
  const categoryColors = {
    '学习': 'bg-learning',
    '生活': 'bg-life',
    '活动': 'bg-event',
    '碎碎念': 'bg-mood'
  };
  return categoryColors[category] || 'secondary';
}

function cancelDelete() {
  var overlay = document.getElementById('deleteConfirmOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

async function confirmDelete(recordId) {
  // 先删服务器数据，成功后再更新本地界面
  try {
    await apiFetch('/api/records/' + recordId, { method: 'DELETE' });
  } catch (err) {
    showToast('删除失败：' + err.message);
    return;
  }

  // 找到并删除记录
  for (var i = 0; i < records.length; i++) {
    if (records[i].id === recordId) {
      records.splice(i, 1);
      break;
    }
  }

  // 骨头数量等于记录总数，奖杯数量等于里程碑记录数
  boneCount = records.length;
  trophyCount = records.filter(record => record.type === 'milestone').length;

  // 更新页面上显示的数量
  updateBoneCount();
  updateTrophyCount();

  cancelDelete();
  
  // 如果当前显示的是时间轴，刷新时间轴
  const treeContainer = document.getElementById('timelineTree');
  if (treeContainer && treeContainer.classList.contains('active')) {
    // 重新显示当前日期的时间轴
    // 获取当前显示的日期，通过解析tree-title元素的文本内容
    const treeTitle = treeContainer.querySelector('.tree-title');
    if (treeTitle) {
      // 提取日期部分，例如从"2025-12-19 记忆之树"中提取"2025-12-19"
      const titleText = treeTitle.textContent;
      const currentDate = titleText.match(/\d{4}-\d{2}-\d{2}/)[0];
      if (currentDate) {
        showDayTimeline(currentDate);
      }
    }
  }
  
  // 无论当前显示什么，都刷新记录花朵显示，确保最新状态
  updateRecordFlowers();
  
  // 更新年份旗帜，确保年份旗帜与记录保持一致
  updateYearFlags();
  
  // 如果当前在森林页面，刷新森林显示
  const forestScene = document.getElementById('forestScene');
  if (forestScene && forestScene.style.display !== 'none') {
    showPage('timeline');
  }
}

// 切换文本展开/收起
function toggleText(element) {
  if (element.classList.contains('expanded')) {
    element.classList.remove('expanded');
    var btn = element.nextElementSibling;
    if (btn && btn.classList.contains('text-toggle-btn')) {
      btn.textContent = '展开';
    }
  } else {
    element.classList.add('expanded');
    var btn = element.nextElementSibling;
    if (btn && btn.classList.contains('text-toggle-btn')) {
      btn.textContent = '收起';
    }
  }
}

// 显示某天时间轴
function showDayTimeline(dateStr) {
  const treeContainer = document.getElementById('timelineTree');
  if (!treeContainer) return;
  
  // 筛选出当天的记录
  const dayRecords = records.filter(record => record.date === dateStr);
  if (dayRecords.length === 0) {
    treeContainer.innerHTML = '<div class="tree-trunk"></div><div class="text-center p-5"><div class="display-1 mb-3">🌳</div><h4 class="text-white">这一天还没有记录</h4><p class="text-white-50">点击下方按钮添加新记录吧</p><button class="btn btn-success mt-3" onclick="showPage(\'add\')"><i class="fas fa-plus me-2"></i>添加新记录</button></div>';
    treeContainer.classList.add('active');
    return;
  }
  
  // 按时间排序
  dayRecords.sort((a, b) => {
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });
  
  // 计算去年同一天是否有记录，用于回顾入口
  const lastYearDate = getLastYearDate(dateStr);
  const lastYearCount = records.filter(record => record.date === lastYearDate).length;

  // 构建时间轴内容
  let html = '<div class="tree-trunk"></div>';
  html += '<div class="tree-crown">';
  html += '<div class="tree-title-row">';
  html += '<h3 class="tree-title text-white mb-2"><i class="fas fa-calendar-alt me-2"></i>' + dateStr + ' 记忆之树</h3>';
  html += '<button class="review-btn" onclick="showLastYearReview(\'' + dateStr + '\')" title="查看去年同一天的记录">';
  html += '<i class="fas fa-history me-1"></i>回顾';
  if (lastYearCount > 0) {
    html += '<span class="review-count">' + lastYearCount + '</span>';
  }
  html += '</button>';
  html += '</div>';
  html += '<p class="text-center text-white-50 mt-1 mb-0">共 ' + dayRecords.length + ' 片叶子</p>';
  html += '</div>';
  html += '<div class="leaves-container">';
  
  dayRecords.forEach(record => {
    // 心情图标映射
      const moodIcons = {
        '开心': '😊',
        '平静': '😐',
        '难过': '😢',
        '兴奋': '🎉',
        '焦虑': '😰',
        '专注': '🎯'
      };
    
    // 分类颜色映射
    const categoryColors = {
      '学习': 'bg-learning',
      '生活': 'bg-life',
      '活动': 'bg-event',
      '碎碎念': 'bg-mood'
    };
    
    // 检查是否需要折叠文本
    const isLongText = record.text.length > 50; // 估算两行文本的字符数
    const hasImage = record.hasImage && record.image;
    const needToggle = isLongText || hasImage; // 长文本或有图片时需要折叠/展开
    const displayText = isLongText ? record.text.substring(0, 50) + '...' : record.text;
    
    html += '<div class="timeline-leaf" data-record-id="' + record.id + '">';
    html += '<div class="leaf-mood-on-trunk"><div class="mood-badge">' + (moodIcons[record.mood] || '😊') + '</div></div>';
    html += '<div class="leaf-content">';
    html += '<div class="leaf-main-row">';
    html += '<span class="badge ' + categoryColors[record.category] + ' text-white leaf-category">' + record.category + '</span>';
    
    // 长文本折叠展开功能 - 只有长文本或有图片时显示
    if (needToggle) {
      html += '<div class="leaf-text-container">';
      html += '<div class="leaf-text-content" id="text-' + record.id + '">' + displayText + '</div>';
      html += '<button class="text-toggle-btn" onclick="toggleRecord(' + record.id + ', `' + record.text.replace(/`/g, '\`') + '`)" id="toggle-' + record.id + '">展开</button>';
      html += '</div>';
    } else {
      html += '<div class="leaf-text-content">' + record.text + '</div>';
    }
    
    html += '<span class="leaf-time"><i class="fas fa-clock time-icon"></i>' + (record.time || '00:00') + '</span>';
    html += '<button class="delete-btn" onclick="showDeleteConfirm(' + record.id + ')"><i class="fas fa-trash-alt"></i></button>';
    html += '</div>';
    
    // 显示图片，不添加点击放大功能
    if (record.hasImage && record.image) {
      html += '<div class="leaf-image-container" id="imageContainer-' + record.id + '" style="margin-top: 0; padding-top: 0; border-top: none;">';
      html += '<div class="leaf-image" style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(255, 255, 255, 0.1);">';
      // 移除点击放大事件，避免点击记忆之花时出现放大弹窗
      html += '<img src="' + record.image + '" alt="记录图片" class="img-fluid rounded collapsed" style="cursor: default;">';
      html += '</div>';
      html += '</div>';
    }
    
    html += '</div>';
    html += '</div>';
    
    // 移除图片放大功能，不再创建模态框
  });
  
  html += '</div>';
  
  // 更新时间轴大树内容
    treeContainer.innerHTML = html;
    treeContainer.classList.add('active');
    
    // 自动滚动到时间轴位置
    setTimeout(() => {
      treeContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }, 100);
    
    // 记忆之树标题已在HTML模板中包含，此处不需要额外更新
}

// 计算去年同一天（处理 2 月 29 日：平年回退到 2 月 28 日）
function getLastYearDate(dateStr) {
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] - 1;
  const month = parts[1];
  const day = parts[2];
  const daysInMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);
  return year + '-' + String(month).padStart(2, '0') + '-' + String(safeDay).padStart(2, '0');
}

// 回顾·去年今日：展示所选日期一年前的记录
function showLastYearReview(dateStr) {
  const lastYearDate = getLastYearDate(dateStr);
  const oldRecords = records
    .filter(record => record.date === lastYearDate)
    .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

  const moodIcons = {
    '开心': '😊',
    '平静': '😐',
    '难过': '😢',
    '焦虑': '😰',
    '专注': '🎯'
  };
  const categoryColors = {
    '学习': 'bg-learning',
    '生活': 'bg-life',
    '活动': 'bg-event',
    '碎碎念': 'bg-mood'
  };

  let bodyHTML;
  if (oldRecords.length === 0) {
    bodyHTML =
      '<div class="review-empty">' +
      '<div class="display-4 mb-3">🍂</div>' +
      '<p class="text-white-50 mb-1">去年的这一天还没有留下记录</p>' +
      '<p class="text-white-50 mb-0">从今天开始记录，明年的今天就能回来看看。</p>' +
      '</div>';
  } else {
    bodyHTML = '<p class="review-summary">去年这一天，你留下了 <strong>' + oldRecords.length + '</strong> 条记录</p>';
    bodyHTML += '<div class="review-list">';
    oldRecords.forEach(record => {
      bodyHTML += '<div class="review-record">';
      bodyHTML += '<div class="review-record-header">';
      bodyHTML += '<span class="badge ' + (categoryColors[record.category] || 'bg-secondary') + ' text-white">' + record.category + '</span>';
      bodyHTML += '<span class="review-mood">' + (moodIcons[record.mood] || '😊') + ' ' + record.mood + '</span>';
      bodyHTML += '<span class="review-time"><i class="fas fa-clock me-1"></i>' + (record.time || '00:00') + '</span>';
      bodyHTML += '</div>';
      bodyHTML += '<p class="review-text">' + record.text + '</p>';
      if (record.hasImage && record.image) {
        bodyHTML += '<img src="' + record.image + '" alt="回顾图片" class="review-image img-fluid">';
      }
      bodyHTML += '</div>';
    });
    bodyHTML += '</div>';
  }

  const modalHTML = '<div class="modal-overlay" id="lastYearReviewOverlay" onclick="hideLastYearReview()">' +
    '<div class="modal-container" onclick="event.stopPropagation()">' +
    '<div class="modal-header">' +
    '<h3><i class="fas fa-history me-2"></i>' + lastYearDate + ' · 去年今日</h3>' +
    '<button class="close-btn" onclick="hideLastYearReview()">&times;</button>' +
    '</div>' +
    '<div class="modal-body">' + bodyHTML + '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-primary" onclick="hideLastYearReview()">关闭</button>' +
    '</div>' +
    '</div>' +
    '</div>';

  hideLastYearReview();
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function hideLastYearReview() {
  const overlay = document.getElementById('lastYearReviewOverlay');
  if (overlay) overlay.remove();
}

// 聚焦到特定年份
function focusOnYear(year) {
  console.log('聚焦到年份:', year);
  
  const layout = computeFlowerLayout();
  
  // 找到该年份第一个有记录的日期
  const firstIndex = layout.dates.findIndex(date => new Date(date).getFullYear() === year);
  if (firstIndex === -1) return;
  
  const position = layout.positions[firstIndex];
  
  // 移动小狗到该年份的第一朵花
  const dog = document.getElementById('runningDog');
  if (dog) {
    dog.style.transition = 'left 1.5s ease-out';
    dog.style.left = position + 'px';
  }
  
  // 将目标花朵滚动到视口中间
  const viewport = document.getElementById('forestViewport');
  if (viewport) {
    viewport.scrollTo({
      left: Math.max(0, position - viewport.clientWidth / 2),
      behavior: 'smooth'
    });
  }
}

// 更新年份旗帜（只显示有记录的年份）
function updateYearFlags() {
  const el = document.getElementById('yearFlags');
  if (!el) return;
  
  // 获取有记录的年份
  const years = [...new Set(records.map(r => new Date(r.date).getFullYear()))];
  years.sort((a, b) => a - b);
  
  if (years.length === 0) {
    el.innerHTML = '';
    return;
  }
  
  // 按日期分组记录
  const recordsByDate = {};
  records.forEach(record => {
    if (!recordsByDate[record.date]) {
      recordsByDate[record.date] = [];
    }
    recordsByDate[record.date].push(record);
  });
  
  // 获取所有日期并按实际日期顺序排序
  const dates = Object.keys(recordsByDate).sort((a, b) => new Date(a) - new Date(b));
  if (dates.length === 0) return;
  
  // 与花朵共用同一套像素布局
  const layout = computeFlowerLayout();
  
  const currentYear = new Date().getFullYear();
  
  let html = '';
  years.forEach(year => {
    // 找到该年份的第一个记录日期
    const yearDates = dates.filter(date => new Date(date).getFullYear() === year);
    const firstDateOfYear = yearDates[0];
    
    // 计算该日期在日期列表中的索引
    const dateIndex = dates.indexOf(firstDateOfYear);
    
    // 使用计算好的位置，与花朵位置保持一致
    const position = layout.positions[dateIndex];
    
    const isCurrent = year === currentYear;
    
    html += `
      <div class="year-flag ${isCurrent ? 'active' : ''}"
           style="left: ${position}px;"
           onclick="focusOnYear(${year})"
           title="${year}年">
        ${year}
      </div>
    `;
  });
  
  el.innerHTML = html;
}

// 图片上传功能
function initImageUpload() {
  console.log('图片上传功能初始化');
}

// 显示庆祝动画
function showCelebrationAnimation(todayCount, isMilestone = false) {
  // 创建庆祝动画元素
  const celebration = document.createElement('div');
  celebration.className = 'celebration-animation';
  celebration.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    text-align: center;
    animation: fadeInOut 3s ease-out forwards;
  `;
  
  // 恭喜信息
  let message = '';
  if (isMilestone) {
    message = '<h2 style="color: #fff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);">🎉 恭喜你获得了一个新的里程碑！</h2>';
  } else if (todayCount === 1) {
    message = '<h2 style="color: #fff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);">恭喜你森林中又绽放了一朵记忆之花！</h2>';
  } else {
    message = `<h2 style="color: #fff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);">你今天已经累计获得 ${todayCount} 个骨头！</h2>`;
  }
  
  // 烟花数量
  const fireworksCount = isMilestone ? 5 : 2;
  let fireworksHTML = '';
  
  // 创建烟花容器
  for (let i = 0; i < fireworksCount; i++) {
    fireworksHTML += `
      <div class="fireworks" style="animation-delay: ${i * 0.3}s; margin: 0 20px;">
        <!-- 核心爆炸 -->
        <!-- 彩色粒子 -->
        ${createFireworkParticles()}
      </div>
    `;
  }
  
  // 添加烟花动画
  celebration.innerHTML = `
    ${message}
    <div style="display: flex; gap: 50px; justify-content: center; align-items: center; margin-top: 20px;">
      ${fireworksHTML}
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(celebration);
  
  // 3秒后移除
  setTimeout(() => {
    document.body.removeChild(celebration);
  }, 3000);
}

// 创建烟花粒子
function createFireworkParticles() {
  let particlesHTML = '';
  const particleCount = 12; // 每个烟花的粒子数量
  
  // 创建不同角度的粒子
  for (let i = 0; i < particleCount; i++) {
    // 计算角度，均匀分布
    const angle = (i / particleCount) * Math.PI * 2;
    // 计算粒子的最终位置（使用三角函数）
    const distance = Math.random() * 80 + 60; // 随机距离，60-140px
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    // 添加随机偏移，让粒子分布更自然
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    
    // 计算最终的CSS变量值
    const finalX = Math.round(x + offsetX);
    const finalY = Math.round(y + offsetY);
    
    particlesHTML += `
      <div 
        class="firework-particle"
        style="
          --x: ${finalX}px;
          --y: ${finalY}px;
          animation-delay: ${Math.random() * 0.3}s;
          animation-duration: ${1.2 + Math.random() * 0.8}s;
        "
      ></div>
    `;
  }
  
  return particlesHTML;
}

// 更新森林场景中的统计信息
function updateForestStats() {
  // 计算有记录的日期数（记忆花朵数量）
  const recordsByDate = {};
  records.forEach(record => {
    if (!recordsByDate[record.date]) {
      recordsByDate[record.date] = [];
    }
    recordsByDate[record.date].push(record);
  });
  const flowerCount = Object.keys(recordsByDate).length;
  
  // 找到显示统计信息的p元素
  const statsElement = document.querySelector('.text-center.py-4.text-white p.text-white-50');
  if (statsElement) {
    statsElement.innerHTML = `已收集 <span class="text-warning fw-bold">${flowerCount}</span> 个记忆花朵<br>已获得 <span class="text-warning fw-bold">${boneCount}</span> 根骨头<br>点击花朵查看那天的故事`;
  }
}

// 横轴布局参数（像素）：每个日期固定占位，超出视口时横向滚动
const FLOWER_SPACING = 72;
const FLOWER_EDGE_PADDING = 40;
const FLOWER_YEAR_GAP = 36;

// 计算所有花朵的像素位置与画布总宽
function computeFlowerLayout() {
  const recordsByDate = {};
  records.forEach(record => {
    if (!recordsByDate[record.date]) {
      recordsByDate[record.date] = [];
    }
    recordsByDate[record.date].push(record);
  });

  const dates = Object.keys(recordsByDate).sort((a, b) => new Date(a) - new Date(b));
  const viewport = document.getElementById('forestViewport');
  const viewportWidth = viewport ? viewport.clientWidth : 0;

  let cursor = FLOWER_EDGE_PADDING;
  const positions = [];

  dates.forEach((date, index) => {
    if (index > 0) {
      const prevYear = new Date(dates[index - 1]).getFullYear();
      const currentYear = new Date(date).getFullYear();
      if (prevYear !== currentYear) {
        cursor += FLOWER_YEAR_GAP;
      }
    }
    positions.push(cursor);
    cursor += FLOWER_SPACING;
  });

  const lastPosition = positions.length ? positions[positions.length - 1] : 0;
  const contentWidth = Math.max(lastPosition + FLOWER_EDGE_PADDING, viewportWidth);

  return { dates, positions, contentWidth };
}

// 更新横向滚动进度轨道
function updateForestProgress() {
  const viewport = document.getElementById('forestViewport');
  const progress = document.getElementById('forestProgress');
  const thumb = document.getElementById('forestProgressThumb');
  if (!viewport || !progress || !thumb) return;

  const maxScroll = viewport.scrollWidth - viewport.clientWidth;
  if (maxScroll <= 1) {
    // 内容不足一屏时进度轨道仍保留，滑块占满整条轨道
    if (records.length === 0) {
      progress.classList.remove('visible');
    } else {
      progress.classList.add('visible');
    }
    thumb.style.width = '100%';
    thumb.style.left = '0';
    return;
  }

  progress.classList.add('visible');
  const ratio = viewport.clientWidth / viewport.scrollWidth;
  const widthPercent = Math.max(ratio * 100, 5);
  const leftPercent = Math.min(100 - widthPercent, (viewport.scrollLeft / viewport.scrollWidth) * 100);
  thumb.style.width = widthPercent + '%';
  thumb.style.left = leftPercent + '%';
}

// 滚动到最新记录
function scrollForestToLatest() {
  const viewport = document.getElementById('forestViewport');
  if (!viewport) return;
  viewport.scrollLeft = viewport.scrollWidth - viewport.clientWidth;
  updateForestProgress();
}

// 初始化横向滚动与进度轨道交互（只执行一次）
function initForestScroll() {
  const viewport = document.getElementById('forestViewport');
  const track = document.getElementById('forestProgressTrack');
  const thumb = document.getElementById('forestProgressThumb');
  if (!viewport || !track || !thumb) return;

  viewport.addEventListener('scroll', updateForestProgress, { passive: true });

  const jumpToPointer = event => {
    if (event.target === thumb) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    viewport.scrollLeft = ratio * (viewport.scrollWidth - viewport.clientWidth);
    updateForestProgress();
  };
  track.addEventListener('pointerdown', jumpToPointer);
  track.addEventListener('click', jumpToPointer);

  let dragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  thumb.addEventListener('pointerdown', event => {
    dragging = true;
    dragStartX = event.clientX;
    dragStartScroll = viewport.scrollLeft;
    thumb.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  thumb.addEventListener('pointermove', event => {
    if (!dragging) return;
    const trackWidth = track.clientWidth || 1;
    const delta = ((event.clientX - dragStartX) / trackWidth) * viewport.scrollWidth;
    viewport.scrollLeft = dragStartScroll + delta;
    updateForestProgress();
  });

  const stopDrag = event => {
    dragging = false;
    if (thumb.hasPointerCapture(event.pointerId)) {
      thumb.releasePointerCapture(event.pointerId);
    }
  };
  thumb.addEventListener('pointerup', stopDrag);
  thumb.addEventListener('pointercancel', stopDrag);

  track.addEventListener('pointerdown', event => {
    if (event.target === thumb) return;
    const rect = track.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    viewport.scrollLeft = ratio * viewport.scrollWidth - viewport.clientWidth / 2;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateRecordFlowers();
      updateYearFlags();
      updateForestProgress();
    }, 200);
  });
}

// 更新记录花朵
function updateRecordFlowers() {
  const flowersContainer = document.getElementById('recordFlowers');
  if (!flowersContainer) return;
  
  // 清空现有花朵
  flowersContainer.innerHTML = '';

  const layout = computeFlowerLayout();
  const container = document.getElementById('forestPathContainer');
  if (container) {
    container.style.width = layout.contentWidth + 'px';
  }

  if (layout.dates.length === 0) {
    moveDogToLatest();
    updateForestProgress();
    return;
  }

  layout.dates.forEach((date, index) => {
    // 格式化日期，只显示月和日
    const formattedDate = new Date(date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    
    // 创建花朵元素
    const flowerSpot = document.createElement('div');
    flowerSpot.className = 'flower-spot has-record';
    flowerSpot.style.left = layout.positions[index] + 'px';
    flowerSpot.setAttribute('data-date', formattedDate); // 只存储月和日
    
    // 日期标签已通过CSS伪元素显示，不需要额外创建
    // 移除了重复的花朵图标，只保留CSS生成的大花
    
    // 添加点击事件
    flowerSpot.addEventListener('click', () => {
      // 记录当前选中的日期
      currentSelectedDate = date;
      
      // 移动小狗到点击的记忆之花位置
      const dog = document.getElementById('runningDog');
      if (dog) {
        dog.style.transition = 'left 1.5s ease-out';
        dog.style.left = layout.positions[index] + 'px';
      }
      
      showDayTimeline(date);
    });
    
    flowersContainer.appendChild(flowerSpot);
  });
  
  // 移动小狗到最新记录位置
  moveDogToLatest();
  updateForestProgress();
}

// 移动小狗到最新记录位置（在最后一朵花下方）
function moveDogToLatest() {
  const dog = document.getElementById('runningDog');
  if (!dog) return;
  
  if (records.length === 0) {
    // 没有记录时，小狗回到初始位置
    dog.style.left = '20px';
    return;
  }

  const layout = computeFlowerLayout();
  if (layout.dates.length === 0) return;

  // 小狗站在最后一朵记忆之花旁边
  dog.style.transition = 'left 1.5s ease-out';
  dog.style.left = layout.positions[layout.positions.length - 1] + 'px';
}

// 更新蜿蜒小路
function updatePathCurve() {
  console.log('更新蜿蜒小路');
}

// 显示提示信息
function showToast(message, type) {
  // 确保 toast 容器存在
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item toast-' + (type || 'info');
  const iconMap = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle', warning: 'exclamation-triangle' };
  const icon = iconMap[type] || 'info-circle';
  toast.innerHTML = '<i class="fas fa-' + icon + '"></i><span>' + message + '</span>';
  container.appendChild(toast);

  // 触发进场动画
  requestAnimationFrame(() => toast.classList.add('toast-show'));

  // 3 秒后自动消失
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 记录整体折叠展开功能
function toggleRecord(recordId, fullText) {
  const recordElement = document.querySelector('.timeline-leaf[data-record-id="' + recordId + '"]');
  const textElement = document.getElementById('text-' + recordId);
  const imgElement = document.querySelector('#imageContainer-' + recordId + ' img');
  const toggleBtn = document.getElementById('toggle-' + recordId);
  
  if (recordElement && toggleBtn) {
    const isExpanded = recordElement.classList.contains('record-expanded');
    
    if (isExpanded) {
      // 折叠整条记录
      recordElement.classList.remove('record-expanded');
      
      // 折叠文本
      if (textElement && fullText) {
        textElement.classList.remove('expanded');
        textElement.textContent = fullText.substring(0, 50) + '...';
      }
      
      // 折叠图片
      if (imgElement) {
        imgElement.classList.add('collapsed');
      }
      
      toggleBtn.textContent = '展开';
      toggleBtn.innerHTML = '展开';
    } else {
      // 展开整条记录
      recordElement.classList.add('record-expanded');
      
      // 展开文本
      if (textElement && fullText) {
        textElement.classList.add('expanded');
        textElement.textContent = fullText;
      }
      
      // 展开图片
      if (imgElement) {
        imgElement.classList.remove('collapsed');
      }
      
      toggleBtn.textContent = '收起';
      toggleBtn.innerHTML = '收起';
    }
  }
}

// 图片放大查看功能已移除

// 显示添加记录弹窗
function showAddRecordModal() {
  // 使用当前选中的日期，如果没有则使用今天
  var selectedDate = currentSelectedDate || new Date().toISOString().split('T')[0];
  
  // 创建弹窗HTML
  var now = new Date();
  var currentTime = now.toTimeString().substring(0, 5); // 获取当前时间 HH:MM
  var modalHTML = '<div class="modal-container">' +
    '<div class="modal-header">' +
    '<h3><i class="fas fa-feather-alt me-2"></i>添加新记录</h3>' +
    '<button class="close-btn" onclick="hideAddRecordModal()">&times;</button>' +
    '</div>' +
    '<form id="recordForm" class="record-form">' +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label for="recordDate"><i class="fas fa-calendar-alt me-1"></i>日期</label>' +
    '<input type="date" class="form-control" id="recordDate" name="date" value="' + selectedDate + '" required>' +
    '</div>' +
    '<div class="form-group">' +
    '<label for="recordTime"><i class="fas fa-clock me-1"></i>时间</label>' +
    '<input type="time" class="form-control" id="recordTime" name="time" value="' + currentTime + '" required>' +
    '</div>' +
    '</div>' +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label for="recordCategory"><i class="fas fa-tag me-1"></i>分类</label>' +
    '<select class="form-control" id="recordCategory" name="category" required>' +
    '<option value="">选择分类</option>' +
    '<option value="学习">学习</option>' +
    '<option value="生活">生活</option>' +
    '<option value="活动">活动</option>' +
    '<option value="碎碎念">碎碎念</option>' +
    '</select>' +
    '</div>' +
    '<div class="form-group">' +
    '<label for="recordMood"><i class="fas fa-smile me-1"></i>心情</label>' +
    '<select class="form-control" id="recordMood" name="mood" required>' +
    '<option value="">选择心情</option>' +
    '<option value="开心">开心 😊</option>' +
    '<option value="平静">平静 😐</option>' +
    '<option value="难过">难过 😢</option>' +
    '<option value="焦虑">焦虑 😰</option>' +
    '<option value="专注">专注 🎯</option>' +
    '</select>' +
    '</div>' +
    '</div>' +
    '<div class="form-group">' +
    '<label for="recordText"><i class="fas fa-pencil-alt me-1"></i>记录内容</label>' +
    '<textarea class="form-control" id="recordText" name="text" rows="4" placeholder="写下今天的故事..." required></textarea>' +
    '</div>' +
    '<div class="form-group">' +
    '<label for="recordImage"><i class="fas fa-image me-1"></i>上传图片（可选）</label>' +
    '<div class="image-upload-area" onclick="document.getElementById(\'recordImage\').click()">' +
    '<div class="upload-placeholder">' +
    '<i class="fas fa-cloud-upload-alt fa-3x mb-3"></i><br>' +
    '<p>点击或拖拽图片到此处上传</p>' +
    '<small class="text-white-50">支持JPG、PNG、GIF格式，最大5MB</small>' +
    '</div>' +
    '<input type="file" id="recordImage" name="image" class="d-none" accept="image/*">' +
    '<div id="imagePreview" class="mt-3"></div>' +
    '</div>' +
    '</div>' +
    '<div class="form-actions">' +
    '<button type="button" class="btn btn-cancel" onclick="hideAddRecordModal()">' +
    '<i class="fas fa-times me-1"></i>取消' +
    '</button>' +
    '<button type="submit" class="btn btn-save">' +
    '<i class="fas fa-save me-1"></i>保存记录' +
    '</button>' +
    '</div>' +
    '</form>' +
    '</div>';
  
  
  // 获取弹窗背景
  var overlay = document.getElementById('addRecordModalOverlay');
  if (!overlay) {
    // 如果元素不存在，创建它
    overlay = document.createElement('div');
    overlay.id = 'addRecordModalOverlay';
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = modalHTML;
  overlay.style.display = 'flex';
  
  // 图片上传处理
  const imageInput = document.getElementById('recordImage');
  const imagePreview = document.getElementById('imagePreview');
  const uploadPlaceholder = document.querySelector('.upload-placeholder');
  let uploadedImage = '';      // 服务器返回的图片地址
  let uploadPromise = null;    // 上传中的请求，提交时等待完成
  let uploadSeq = 0;

  function renderImagePreview(src, uploading) {
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
    imagePreview.innerHTML = '<div class="preview-card">' +
      '<div class="preview-header">' +
      '<span><i class="fas ' + (uploading ? 'fa-spinner fa-spin text-warning' : 'fa-check-circle text-success') + ' me-2"></i>' +
      (uploading ? '图片上传中...' : '图片已上传') + '</span>' +
      '<button type="button" class="btn btn-sm btn-danger" onclick="removeImage()">' +
      '<i class="fas fa-times"></i> 删除' +
      '</button>' +
      '</div>' +
      '<div class="preview-body text-center">' +
      '<img src="' + src + '" alt="预览" class="img-fluid">' +
      '</div>' +
      '</div>';
  }

  function uploadSelectedImage(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('只支持图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片不能超过 5MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    renderImagePreview(localPreview, true);

    const seq = ++uploadSeq;
    const formData = new FormData();
    formData.append('image', file);
    uploadPromise = apiFetch('/api/uploads', { method: 'POST', body: formData })
      .then(function(data) {
        if (seq !== uploadSeq) return;
        uploadedImage = data.url;
        renderImagePreview(data.url, false);
      })
      .catch(function(err) {
        if (seq !== uploadSeq) return;
        uploadedImage = '';
        uploadPromise = null;
        imagePreview.innerHTML = '';
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
        showToast('图片上传失败：' + err.message);
      });
  }

  // 图片选择
  imageInput.addEventListener('change', function(e) {
    uploadSelectedImage(e.target.files[0]);
  });

  // 删除图片预览
  window.removeImage = function() {
    uploadSeq++;
    uploadedImage = '';
    uploadPromise = null;
    imageInput.value = '';
    imagePreview.innerHTML = '';
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
  };

  // 拖拽上传功能
  const uploadArea = document.querySelector('.image-upload-area');
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', function() {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    uploadSelectedImage(e.dataTransfer.files[0]);
  });
  
  // 添加文本输入监听，实时自动分类和心情识别
    const textArea = document.getElementById('recordText');
    const categorySelect = document.getElementById('recordCategory');
    const moodSelect = document.getElementById('recordMood');
    
    // 移除自动分类弹窗，实现静默自动分类和心情识别
    textArea.addEventListener('input', function() {
      const text = this.value;
      // 降低触发自动匹配的文本长度要求，只要有内容就进行匹配
      if (text.length > 0) {
        // 自动分类
        const autoCategory = autoClassify(text);
        categorySelect.value = autoCategory;
        
        // 自动识别心情
        const autoMood = autoDetectMood(text);
        moodSelect.value = autoMood;
        
        // 分类为学习时自动匹配心情为专注，优先级高于自动识别
        if (autoCategory === '学习') {
          moodSelect.value = '专注';
        }
      }
    });
    
    // 分类变化时的处理
    categorySelect.addEventListener('change', function() {
      // 分类为学习时自动匹配心情为专注，优先级高于自动识别
      if (this.value === '学习') {
        moodSelect.value = '专注';
      } else {
        // 其他分类时，根据文本自动识别心情
        const text = textArea.value;
        if (text.length > 5) {
          moodSelect.value = autoDetectMood(text);
        }
      }
    });
  
  document.getElementById('recordForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 如果图片还在上传，等它完成再保存
    if (uploadPromise) await uploadPromise;

    var form = e.target;
    var date = form.date.value;
    var time = form.time.value;
    var category = form.category.value;
    var mood = form.mood.value;
    var text = form.text.value.trim();

    if (!text) {
      showToast('记录内容不能为空');
      return;
    }

    // 构建完整的日期时间字符串
    var datetimeStr = date + 'T' + time + ':00';
    var timestamp = new Date(datetimeStr).toISOString();

    // 尊重用户手动选择，分类为学习时心情固定为专注
    if (category === '学习') {
      mood = '专注';
    }

    var newRecord = {
      date: date,
      time: time,
      timestamp: timestamp,
      category: category,
      mood: mood,
      text: text,
      hasImage: !!uploadedImage,
      image: uploadedImage || '',
      type: detectRecordType(text), // 识别记录类型（碎碎念/里程碑）
      tags: extractTags(text),      // 提取关键词标签
      checkIn: detectCheckIn(text)  // 打卡信息
    };

    var submitBtn = form.querySelector('.btn-save');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const saved = await apiFetch('/api/records', {
        method: 'POST',
        body: JSON.stringify(newRecord)
      });

      records.push(saved);

      // 骨头数量等于记录总数，奖杯数量等于里程碑记录数
      boneCount = records.length;
      trophyCount = records.filter(record => record.type === 'milestone').length;
      updateBoneCount();
      updateTrophyCount();

      // 计算当天记录数量并显示庆祝动画
      const todayCount = records.filter(record => record.date === date).length;
      showCelebrationAnimation(todayCount, saved.type === 'milestone');

      hideAddRecordModal();

      // 添加记录后自动显示该记录所在日期的记忆之树
      const forestScene = document.getElementById('forestScene');
      if (forestScene) forestScene.style.display = 'block';

      showDayTimeline(date);
      updateRecordFlowers();
      updateYearFlags();
      updateForestStats();

      setTimeout(() => {
        const treeContainer = document.getElementById('timelineTree');
        if (treeContainer) {
          treeContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    } catch (err) {
      showToast('保存失败：' + err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// 隐藏添加记录弹窗
function hideAddRecordModal() {
  var overlay = document.getElementById('addRecordModalOverlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
}

// 初始化：从后端加载当前用户的记录
async function init() {
  records = await apiFetch('/api/records');

  // 骨头数量等于记录总数，奖杯数量等于里程碑记录数
  boneCount = records.length;
  trophyCount = records.filter(record => record.type === 'milestone').length;

  updateBoneCount();
  updateTrophyCount();

  // 仅管理员显示「用户管理」入口
  const isAdmin = localStorage.getItem('ct_is_admin') === '1';
  const adminBtn = document.getElementById('navAdminUsers');
  if (adminBtn) adminBtn.classList.toggle('d-none', !isAdmin);

  initForestScroll();
  showPage('timeline');
}

// 显示打卡日期弹窗
function showCheckInDates(datesStr, topic) {
  // 将逗号分隔的字符串转换为数组
  const dates = datesStr.split(',');
  
  // 创建打卡日期弹窗HTML
  const modalHTML = '<div class="modal-overlay" onclick="hideCheckInDates()">' +
    '<div class="modal-container" onclick="event.stopPropagation()">' +
    '<div class="modal-header">' +
    '<h3><i class="fas fa-calendar-alt me-2"></i>' + topic + ' 打卡日期</h3>' +
    '<button class="close-btn" onclick="hideCheckInDates()">&times;</button>' +
    '</div>' +
    '<div class="modal-body">' +
    '<div class="checkin-dates-modal">' +
    '<strong>总打卡天数:</strong> ' + dates.length + '<br>' +
    '<strong>最早打卡:</strong> ' + dates[0] + '<br>' +
    '<strong>最晚打卡:</strong> ' + dates[dates.length - 1] + '<br>' +
    '<div class="mt-3">' +
    '<strong>打卡日期列表:</strong>' +
    '<ul class="checkin-dates-list mt-2">' +
    dates.map(date => '<li>' + date + '</li>').join('') +
    '</ul>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-primary" onclick="hideCheckInDates()">关闭</button>' +
    '</div>' +
    '</div>' +
    '</div>';
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 隐藏打卡日期弹窗
function hideCheckInDates() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// ============================================================
// 知识库 RAG 前端逻辑
// ============================================================
function kbFormatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function kbStatusBadge(status) {
  if (status === 'ready') return '<span class="badge bg-success">就绪</span>';
  if (status === 'processing') return '<span class="badge bg-warning text-dark">处理中</span>';
  if (status === 'error') return '<span class="badge bg-danger">失败</span>';
  return '<span class="badge bg-secondary">' + status + '</span>';
}

async function kbLoadDocs() {
  const listEl = document.getElementById('kbDocList');
  const countEl = document.getElementById('kbDocCount');
  if (!listEl) return;
  try {
    const docs = await apiFetch('/api/kb/documents');
    if (countEl) countEl.textContent = docs.length;
    if (!docs.length) {
      listEl.innerHTML = '<div class="text-white-50 small text-center py-3">还没有上传文档</div>';
      return;
    }
    listEl.innerHTML = docs.map(function(d) {
      return '<div class="kb-doc-item d-flex align-items-center justify-content-between py-2 border-bottom border-secondary border-opacity-25" data-doc-id="' + d.id + '">' +
        '<div class="me-2 text-truncate" title="' + d.originalName + '">' +
          '<div class="text-white small text-truncate"><i class="fas fa-file-alt me-2 text-warning"></i>' + d.originalName + '</div>' +
          '<div class="text-white-50 small">' + kbFormatSize(d.size) + ' · ' + d.chunkCount + ' 切片 · ' + kbStatusBadge(d.status) + '</div>' +
          (d.error ? '<div class="text-danger small">错误：' + d.error + '</div>' : '') +
        '</div>' +
        '<div class="kb-doc-actions d-flex align-items-center gap-1">' +
          '<button type="button" class="btn btn-sm btn-outline-danger kb-del-btn" data-doc-id="' + d.id + '" title="删除"><i class="fas fa-trash-alt"></i></button>' +
          '<button type="button" class="btn btn-sm btn-danger kb-del-confirm d-none" data-doc-id="' + d.id + '" title="确认删除">确认</button>' +
          '<button type="button" class="btn btn-sm btn-outline-secondary kb-del-cancel d-none" data-doc-id="' + d.id + '" title="取消">取消</button>' +
        '</div>' +
      '</div>';
    }).join('');

    // 绑定删除按钮（事件委托）
    listEl.querySelectorAll('.kb-del-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-doc-id');
        const item = btn.closest('.kb-doc-item');
        item.querySelector('.kb-del-btn').classList.add('d-none');
        item.querySelector('.kb-del-confirm').classList.remove('d-none');
        item.querySelector('.kb-del-cancel').classList.remove('d-none');
      });
    });
    listEl.querySelectorAll('.kb-del-cancel').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const item = btn.closest('.kb-doc-item');
        item.querySelector('.kb-del-btn').classList.remove('d-none');
        item.querySelector('.kb-del-confirm').classList.add('d-none');
        item.querySelector('.kb-del-cancel').classList.add('d-none');
      });
    });
    listEl.querySelectorAll('.kb-del-confirm').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-doc-id');
        kbDeleteDoc(id);
      });
    });
  } catch (err) {
    listEl.innerHTML = '<div class="text-danger small text-center py-3">加载失败：' + err.message + '</div>';
  }
}

async function kbUploadFile(file) {
  const statusEl = document.getElementById('kbUploadStatus');
  if (!file) return;
  const allowed = ['.txt', '.md', '.csv', '.pdf', '.docx'];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (allowed.indexOf(ext) < 0) {
    if (statusEl) statusEl.innerHTML = '<span class="text-danger">不支持的文件格式</span>';
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    if (statusEl) statusEl.innerHTML = '<span class="text-danger">文件超过 50MB</span>';
    return;
  }

  if (statusEl) statusEl.innerHTML = '<span class="text-warning"><i class="fas fa-spinner fa-spin"></i> 正在解析并向量化…</span>';
  const fd = new FormData();
  fd.append('document', file);
  try {
    const result = await apiFetch('/api/kb/documents', { method: 'POST', body: fd });
    if (result && result.status === 'error') {
      if (statusEl) statusEl.innerHTML = '<span class="text-danger"><i class="fas fa-exclamation-circle"></i> 处理失败：' + (result.error || '未知错误') + '</span>';
    } else {
      if (statusEl) statusEl.innerHTML = '<span class="text-success"><i class="fas fa-check-circle"></i> 上传成功（' + (result.chunkCount || 0) + ' 切片）</span>';
    }
    kbLoadDocs();
  } catch (err) {
    if (statusEl) statusEl.innerHTML = '<span class="text-danger">上传失败：' + err.message + '</span>';
  }
}

async function kbDeleteDoc(id) {
  const item = document.querySelector('.kb-doc-item[data-doc-id="' + id + '"]');
  if (item) {
    item.style.opacity = '0.5';
    item.querySelector('.kb-del-confirm').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  }
  try {
    await apiFetch('/api/kb/documents/' + id, { method: 'DELETE' });
    showToast('文档已删除', 'success');
    kbLoadDocs();
  } catch (err) {
    showToast('删除失败：' + err.message);
    if (item) item.style.opacity = '1';
  }
}

function kbRenderAnswer(result) {
  const box = document.getElementById('kbAnswerBox');
  if (!box) return;
  const answer = (result.answer || '').trim();
  let html = '<div class="kb-answer-text">' + answer.replace(/\n/g, '<br>') + '</div>';
  if (result.citations && result.citations.length) {
    html += '<hr class="border-secondary opacity-25 my-3">';
    html += '<div class="kb-citations"><div class="text-white-50 small mb-2"><i class="fas fa-quote-left me-1"></i>引用来源：</div>';
    result.citations.forEach(function(c) {
      html += '<div class="kb-citation-item mb-2">' +
        '<div class="text-warning small"><i class="fas fa-file-alt me-1"></i>' + c.docName + '</div>';
      (c.snippets || []).forEach(function(s) {
        html += '<blockquote class="kb-snippet small text-white-75 mb-1">' + s.text + '</blockquote>';
      });
      html += '</div>';
    });
    html += '</div>';
  }
  box.innerHTML = html;
}

async function kbAsk() {
  const input = document.getElementById('kbQuestion');
  const btn = document.getElementById('kbAskBtn');
  const box = document.getElementById('kbAnswerBox');
  const question = input ? input.value.trim() : '';
  if (!question) return;

  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 思考中…'; }
  if (box) box.innerHTML = '<div class="text-white-50 text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

  try {
    const result = await apiFetch('/api/kb/ask', { method: 'POST', body: JSON.stringify({ question: question }) });
    kbRenderAnswer(result);
  } catch (err) {
    if (box) box.innerHTML = '<div class="text-danger text-center py-4"><i class="fas fa-exclamation-circle me-1"></i>' + err.message + '</div>';
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> 提问'; }
  }
}

function kbInitPage() {
  const dropZone = document.getElementById('kbDropZone');
  const fileInput = document.getElementById('kbFileInput');
  const askBtn = document.getElementById('kbAskBtn');
  const questionInput = document.getElementById('kbQuestion');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', function() { fileInput.click(); });
    fileInput.addEventListener('change', function() {
      if (fileInput.files && fileInput.files[0]) kbUploadFile(fileInput.files[0]);
      fileInput.value = '';
    });
    ['dragenter', 'dragover'].forEach(function(ev) {
      dropZone.addEventListener(ev, function(e) { e.preventDefault(); dropZone.classList.add('kb-drop-active'); });
    });
    ['dragleave', 'drop'].forEach(function(ev) {
      dropZone.addEventListener(ev, function(e) { e.preventDefault(); dropZone.classList.remove('kb-drop-active'); });
    });
    dropZone.addEventListener('drop', function(e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) kbUploadFile(e.dataTransfer.files[0]);
    });
  }

  if (askBtn) askBtn.addEventListener('click', kbAsk);
  if (questionInput) {
    questionInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') kbAsk(); });
  }

  kbLoadDocs();
}

// ---------- 用户管理 ----------
async function usersLoad() {
  const tbody = document.getElementById('userTableBody');
  const countEl = document.getElementById('userCount');
  try {
    const users = await apiFetch('/api/admin/users');
    if (countEl) countEl.textContent = users.length + ' 位用户';
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-white-50 py-4">暂无注册用户</td></tr>';
      return;
    }
    tbody.innerHTML = users.map(function(u) {
      return '<tr>' +
        '<td>' + u.id + '</td>' +
        '<td><i class="fas fa-user-circle me-2 text-white-50"></i>' + u.username + '</td>' +
        '<td class="text-white-50 small">' + u.createdAt + '</td>' +
        '<td class="text-center"><span class="badge bg-info">' + u.recordCount + '</span></td>' +
        '<td class="text-center"><span class="badge bg-warning">' + u.kbDocCount + '</span></td>' +
        '<td class="text-center">' +
          '<button class="btn btn-outline-danger btn-sm" onclick="usersDelete(' + u.id + ', \'' + String(u.username).replace(/'/g, "\\'") + '\')">' +
            '<i class="fas fa-trash"></i>' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">加载失败：' + err.message + '</td></tr>';
  }
}

function usersDelete(id, username) {
  if (!confirm('确定要删除用户「' + username + '」吗？\n\n该用户的所有记录、知识文档、上传的图片与文件以及向量库切片都将被永久删除，且无法恢复。')) return;

  const btn = event.currentTarget;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }

  apiFetch('/api/admin/users/' + id, { method: 'DELETE' })
    .then(function() {
      showToast('用户「' + username + '」已删除', 'success');
      usersLoad();
    })
    .catch(function(err) {
      showToast('删除失败：' + err.message, 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-trash"></i>'; }
    });
}

// 登录成功后由 auth.js 调用 init()

// ---------- 修改密码 ----------
function showChangePassword() {
  const overlay = document.getElementById('changePwdOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.getElementById('oldPwd').value = '';
  document.getElementById('newPwd').value = '';
  document.getElementById('confirmPwd').value = '';
  const err = document.getElementById('changePwdError');
  if (err) { err.style.display = 'none'; err.textContent = ''; }
  document.getElementById('oldPwd').focus();
}

function closeChangePassword() {
  const overlay = document.getElementById('changePwdOverlay');
  if (overlay) overlay.style.display = 'none';
}

async function submitChangePassword(e) {
  e.preventDefault();
  const oldPwd = document.getElementById('oldPwd').value;
  const newPwd = document.getElementById('newPwd').value;
  const confirmPwd = document.getElementById('confirmPwd').value;
  const errEl = document.getElementById('changePwdError');
  const btn = document.getElementById('changePwdSubmit');

  errEl.style.display = 'none';
  errEl.textContent = '';

  if (newPwd !== confirmPwd) {
    errEl.textContent = '两次输入的新密码不一致';
    errEl.style.display = 'block';
    return;
  }

  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';

  try {
    await apiFetch('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
    });
    showToast('密码修改成功，请重新登录', 'success');
    closeChangePassword();
    // 清除 token 并回到登录页
    localStorage.removeItem('token');
    location.reload();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerHTML = original;
  }
}




