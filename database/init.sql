-- 问卷查询小程序数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `questionnaire_query` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `questionnaire_query`;

-- 用户表
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` varchar(100) NOT NULL COMMENT '微信openid',
  `nick_name` varchar(50) DEFAULT NULL COMMENT '昵称',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `is_vip` tinyint(1) DEFAULT 0 COMMENT '是否VIP用户',
  `vip_expiry_date` datetime DEFAULT NULL COMMENT 'VIP到期时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_openid` (`openid`),
  KEY `idx_phone` (`phone`),
  KEY `idx_is_vip` (`is_vip`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 问卷表
CREATE TABLE `questionnaires` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '问卷ID',
  `platform` varchar(50) NOT NULL COMMENT '问卷平台',
  `q_number` varchar(100) NOT NULL COMMENT '问卷编号',
  `reward_points` int(11) NOT NULL DEFAULT 0 COMMENT '奖励积分',
  `notes` text DEFAULT NULL COMMENT '筛选条件说明',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_platform_number` (`platform`, `q_number`),
  KEY `idx_platform` (`platform`),
  KEY `idx_reward_points` (`reward_points`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷表';

-- 查询历史表
CREATE TABLE `query_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '查询ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `questionnaire_id` int(11) NOT NULL COMMENT '问卷ID',
  `query_params` json DEFAULT NULL COMMENT '查询参数',
  `result_data` json DEFAULT NULL COMMENT '查询结果',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '查询时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_questionnaire_id` (`questionnaire_id`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='查询历史表';

-- 激活码表
CREATE TABLE `activation_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '激活码ID',
  `code` varchar(50) NOT NULL COMMENT '激活码',
  `duration_days` int(11) NOT NULL DEFAULT 30 COMMENT '有效天数',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '状态：0-未使用，1-已使用',
  `used_by` int(11) DEFAULT NULL COMMENT '使用者用户ID',
  `used_at` timestamp NULL DEFAULT NULL COMMENT '使用时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_used_by` (`used_by`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活码表';

-- 轮播图表
CREATE TABLE `carousels` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
  `image_url` varchar(255) NOT NULL COMMENT '图片URL',
  `link` varchar(255) DEFAULT NULL COMMENT '跳转链接',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序权重',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort` (`sort`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图表';

-- 公告表
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title` varchar(200) NOT NULL COMMENT '公告标题',
  `content` text NOT NULL COMMENT '公告内容',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- 插入初始数据

-- 插入测试问卷数据
INSERT INTO `questionnaires` (`platform`, `q_number`, `reward_points`, `notes`) VALUES
('问卷星', 'Q001', 10, '年龄：18-35岁，职业：学生、白领'),
('问卷星', 'Q002', 15, '性别：女性，年龄：25-40岁，有购物经验'),
('腾讯问卷', 'T001', 8, '年龄：18-25岁，在校学生'),
('腾讯问卷', 'T002', 12, '职业：上班族，工作经验：1-5年'),
('金数据', 'J001', 20, '高收入群体，月收入8000以上'),
('金数据', 'J002', 18, '有车一族，驾龄3年以上');

-- 插入测试激活码数据
INSERT INTO `activation_codes` (`code`, `duration_days`, `description`) VALUES
('DEMO-2024-ABCD-EFGH', 30, '演示激活码'),
('TEST-2024-1234-5678', 60, '测试激活码'),
('FREE-2024-WXYZ-9876', 90, '免费体验激活码');

-- 插入轮播图数据
INSERT INTO `carousels` (`image_url`, `link`, `sort`, `status`) VALUES
('https://via.placeholder.com/800x400/4285f4/fff?text=轮播图1', 'https://example.com/1', 1, 1),
('https://via.placeholder.com/800x400/34a853/fff?text=轮播图2', 'https://example.com/2', 2, 1),
('https://via.placeholder.com/800x400/ea4335/fff?text=轮播图3', 'https://example.com/3', 3, 1);

-- 插入公告数据
INSERT INTO `announcements` (`title`, `content`, `status`) VALUES
('系统上线通知', '问卷查询系统正式上线，欢迎大家使用！支持多平台问卷查询，VIP用户享受更多特权。', 1),
('VIP功能介绍', 'VIP用户可以无限制查询问卷信息，获得详细的筛选条件说明，优先获得高积分问卷推荐。', 1),
('使用指南', '1. 注册并登录系统\n2. 激活VIP会员\n3. 搜索问卷编号\n4. 查看筛选条件和积分信息', 1);

-- 创建索引优化查询性能
CREATE INDEX `idx_users_vip_expiry` ON `users` (`vip_expiry_date`);
CREATE INDEX `idx_query_history_user_created` ON `query_history` (`user_id`, `created_at`);
CREATE INDEX `idx_activation_codes_status_created` ON `activation_codes` (`status`, `created_at`);

-- 创建视图便于统计查询
CREATE VIEW `v_user_stats` AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  SUM(CASE WHEN is_vip = 1 THEN 1 ELSE 0 END) as new_vips
FROM users 
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE VIEW `v_platform_stats` AS
SELECT 
  platform,
  COUNT(*) as count,
  AVG(reward_points) as avg_points,
  MIN(reward_points) as min_points,
  MAX(reward_points) as max_points
FROM questionnaires 
GROUP BY platform
ORDER BY count DESC;

-- 触发器：自动清理过期VIP用户
DELIMITER $$
CREATE TRIGGER `tr_clean_expired_vip` 
BEFORE UPDATE ON `users`
FOR EACH ROW
BEGIN
  IF NEW.is_vip = 1 AND NEW.vip_expiry_date IS NOT NULL AND NEW.vip_expiry_date < NOW() THEN
    SET NEW.is_vip = 0;
  END IF;
END$$
DELIMITER ;

-- 存储过程：批量生成激活码
DELIMITER $$
CREATE PROCEDURE `sp_generate_activation_codes`(
  IN p_count INT,
  IN p_duration_days INT,
  IN p_description VARCHAR(255)
)
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE v_code VARCHAR(50);
  
  WHILE i < p_count DO
    SET v_code = CONCAT(
      'AC-',
      YEAR(NOW()), '-',
      LPAD(MONTH(NOW()), 2, '0'),
      LPAD(DAY(NOW()), 2, '0'), '-',
      LPAD(FLOOR(RAND() * 10000), 4, '0')
    );
    
    INSERT INTO activation_codes (code, duration_days, description)
    VALUES (v_code, p_duration_days, p_description);
    
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

-- 创建定时任务清理过期数据（需要开启事件调度器）
-- SET GLOBAL event_scheduler = ON;
-- 
-- CREATE EVENT IF NOT EXISTS `ev_clean_expired_vip`
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO
--   UPDATE users SET is_vip = 0 WHERE is_vip = 1 AND vip_expiry_date < NOW();

-- 授予应用用户权限（生产环境建议创建专门的应用用户）
-- CREATE USER 'questionnaire_app'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON questionnaire_query.* TO 'questionnaire_app'@'localhost';
-- FLUSH PRIVILEGES;

-- 数据库性能优化建议
-- 1. 定期分析表：ANALYZE TABLE table_name;
-- 2. 定期优化表：OPTIMIZE TABLE table_name;
-- 3. 监控慢查询：开启 slow_query_log
-- 4. 根据实际使用情况调整索引

COMMIT;