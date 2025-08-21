const express = require('express');
const multer = require('multer');
const router = express.Router();

// 配置multer使用内存存储
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  }
});

// 导入控制器
const AuthController = require('../controllers/authController');
const QueryController = require('../controllers/queryController');
const CommonController = require('../controllers/commonController');
const AdminController = require('../controllers/adminController');

// 认证相关路由
router.post('/auth/wechat-login', AuthController.wechatLogin);
router.post('/auth/activate-vip', AuthController.activateVip);
router.get('/auth/user/:user_id', AuthController.getUserInfo);

// 查询相关路由
router.post('/query', QueryController.queryQuestionnaire);
router.get('/query/history/:user_id', QueryController.getUserQueryHistory);
router.delete('/query/history/:record_id', QueryController.deleteQueryRecord);
router.post('/query/clear-history', QueryController.clearUserHistory);

// 公共接口路由
router.get('/carousels', CommonController.getCarousels);
router.get('/announcements', CommonController.getAnnouncements);
router.get('/announcements/:id', CommonController.getAnnouncementDetail);
router.get('/platforms', CommonController.getPlatforms);
router.get('/health', CommonController.healthCheck);

// 管理员路由
router.post('/admin/login', AdminController.login);
router.get('/admin/dashboard/stats', AdminController.getDashboardStats);
router.get('/admin/platform/stats', AdminController.getPlatformStats);
router.get('/admin/member/stats', AdminController.getMemberStats);

// 管理员 - 公告管理
router.get('/admin/announcements', AdminController.getAnnouncements);
router.post('/admin/announcements', AdminController.createAnnouncement);
router.put('/admin/announcements/:id', AdminController.updateAnnouncement);
router.delete('/admin/announcements/:id', AdminController.deleteAnnouncement);
router.patch('/admin/announcements/:id/status', AdminController.toggleAnnouncementStatus);

// 管理员 - 用户管理
router.get('/admin/users', AdminController.getUsers);

// 管理员 - 问卷管理
router.get('/admin/questionnaires', AdminController.getQuestionnaires);
router.get('/admin/questionnaires/:id', AdminController.getQuestionnaireById);
router.post('/admin/questionnaires', AdminController.createQuestionnaire);
router.put('/admin/questionnaires/:id', AdminController.updateQuestionnaire);
router.delete('/admin/questionnaires/:id', AdminController.deleteQuestionnaire);

// 管理员 - 激活码管理
router.get('/admin/activation-codes', AdminController.getActivationCodes);
router.post('/admin/activation-codes/generate', AdminController.generateActivationCode);

// 管理员 - 轮播图管理
router.get('/admin/carousels', AdminController.getCarousels);
router.post('/admin/carousels', AdminController.createCarousel);
router.put('/admin/carousels/:id', AdminController.updateCarousel);
router.delete('/admin/carousels/:id', AdminController.deleteCarousel);

// 管理员 - 图片上传
router.post('/admin/upload/carousel-image', upload.single('image'), AdminController.uploadCarouselImage);

module.exports = router;