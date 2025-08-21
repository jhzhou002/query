const qiniu = require('qiniu');

// 七牛云配置
const config = {
  ACCESS_KEY: 'nfxmZVGEHjkd8Rsn44S-JSynTBUUguTScil9dDvC',
  SECRET_KEY: '9lZjiRtRLL0U_MuYkcUZBAL16TlIJ8_dDSbTqqU2',
  BUCKET_NAME: 'youxuan-images',
  BUCKET_DOMAIN: '', // 七牛云空间绑定的域名，部署时需要配置
  FOLDER: 'questionnaire/' // 存储文件夹
};

// 生成上传凭证
const generateUploadToken = (key) => {
  const mac = new qiniu.auth.digest.Mac(config.ACCESS_KEY, config.SECRET_KEY);
  const options = {
    scope: key ? `${config.BUCKET_NAME}:${key}` : config.BUCKET_NAME,
    expires: 3600 // 1小时有效期
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
};

// 生成文件名
const generateFileName = (originalName) => {
  const ext = originalName.split('.').pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${config.FOLDER}carousel_${timestamp}_${random}.${ext}`;
};

// 上传文件到七牛云
const uploadToQiniu = (file, fileName) => {
  return new Promise((resolve, reject) => {
    const token = generateUploadToken(fileName);
    const qiniuConfig = new qiniu.conf.Config();
    // 华东区域
    qiniuConfig.zone = qiniu.zone.Zone_z0;
    
    const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
    const putExtra = new qiniu.form_up.PutExtra();
    
    // 使用文件流上传
    formUploader.put(token, fileName, file, putExtra, (respErr, respBody, respInfo) => {
      if (respErr) {
        reject(respErr);
        return;
      }
      
      if (respInfo.statusCode === 200) {
        resolve({
          key: respBody.key,
          hash: respBody.hash,
          url: `https://${config.BUCKET_DOMAIN}/${respBody.key}` // 完整URL需要配置域名
        });
      } else {
        reject(new Error(`上传失败: ${respInfo.statusCode}`));
      }
    });
  });
};

module.exports = {
  config,
  generateUploadToken,
  generateFileName,
  uploadToQiniu
};