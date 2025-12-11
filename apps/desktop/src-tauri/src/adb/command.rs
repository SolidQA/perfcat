use crate::adb::error::{AdbError, Result};
use once_cell::sync::OnceCell;
use std::{
  process::{Command, Stdio},
  sync::Mutex,
};

#[derive(Debug, Clone)]
pub struct AdbBinary {
  pub path: Option<String>,
}

static ADB_BIN: OnceCell<Mutex<AdbBinary>> = OnceCell::new();

fn adb_bin() -> &'static Mutex<AdbBinary> {
  ADB_BIN.get_or_init(|| Mutex::new(AdbBinary { path: None }))
}

pub fn set_adb_path(path: Option<String>) {
  if let Ok(mut guard) = adb_bin().lock() {
    guard.path = path.map(|p| p.trim().to_string()).filter(|p| !p.is_empty());
  }
}

pub fn current_adb_path() -> String {
  // 首先检查手动设置的路径
  if let Some(path) = adb_bin().lock().ok().and_then(|cfg| cfg.path.clone()) {
    return path;
  }

  // 尝试自动查找ADB路径
  if let Ok(path) = find_adb_path() {
    return path;
  }

  // 默认使用adb命令
  "adb".to_string()
}

fn find_adb_path() -> Result<String> {
  // 常见的ADB安装路径
  let possible_paths = [
    "/usr/local/bin/adb",
    "/opt/homebrew/bin/adb",
    "/usr/bin/adb",
    "/bin/adb",
    // Android Studio默认路径
    "/Users/caishilong/Library/Android/sdk/platform-tools/adb",
    "/Users/caishilong/Android/Sdk/platform-tools/adb",
    // 系统PATH中的adb
  ];

  for path in &possible_paths {
    if std::path::Path::new(path).exists() {
      return Ok(path.to_string());
    }
  }

  // 最后尝试which命令
  match Command::new("which").arg("adb").output() {
    Ok(output) if output.status.success() => {
      let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
      if !path.is_empty() {
        Ok(path)
      } else {
        Err(AdbError::NotFound)
      }
    }
    _ => Err(AdbError::NotFound),
  }
}

pub fn run_host(args: &[&str]) -> Result<String> {
  run_raw(&current_adb_path(), args)
}

pub fn run_device(device_id: &str, args: &[&str]) -> Result<String> {
  let mut full = Vec::with_capacity(args.len() + 2);
  full.push("-s");
  full.push(device_id);
  full.extend_from_slice(args);
  run_raw(&current_adb_path(), &full)
}

fn run_raw(bin: &str, args: &[&str]) -> Result<String> {
  let mut cmd = Command::new(bin);
  cmd.args(args)
    .stdout(Stdio::piped())
    .stderr(Stdio::piped());

  // 在Windows上避免弹出命令窗口
  #[cfg(target_os = "windows")]
  {
    use std::os::windows::process::CommandExt;
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
  }

  let output = cmd.output().map_err(|_| AdbError::NotFound)?;

  if !output.status.success() {
    let err = String::from_utf8_lossy(&output.stderr).trim().to_string();
    return Err(AdbError::CommandFailed(err));
  }

  Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[allow(dead_code)]
pub fn try_ping_server() -> Result<()> {
  let _ = run_host(&["start-server"]).map_err(|e| AdbError::Client(format!("{e}")))?;
  Ok(())
}

