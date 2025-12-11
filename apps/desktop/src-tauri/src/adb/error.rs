use thiserror::Error;

#[derive(Debug, Error)]
pub enum AdbError {
  #[error("ADB 未找到，请检查环境变量或手动配置路径")]
  NotFound,
  #[error("ADB 执行失败: {0}")]
  CommandFailed(String),
  #[error("ADB 输出解析失败: {0}")]
  ParseFailed(String),
  #[error("ADB 客户端错误: {0}")]
  #[allow(dead_code)]
  Client(String),
}

pub type Result<T> = std::result::Result<T, AdbError>;

