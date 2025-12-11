use crate::adb::{
  command::run_host,
  error::Result,
  DeviceInfo,
};

pub fn list_devices() -> Result<Vec<DeviceInfo>> {
  // 直接使用 adb CLI，避免 adb_client 与本地 server 通信阻塞
  list_with_cli()
}

fn list_with_cli() -> Result<Vec<DeviceInfo>> {
  let raw = run_host(&["devices", "-l"])?;
  let mut devices = Vec::new();

  for line in raw.lines() {
    if line.starts_with("List of devices") || line.trim().is_empty() {
      continue;
    }

    let mut parts = line.split_whitespace();
    let id = match parts.next() {
      Some(v) => v.to_string(),
      None => continue,
    };

    let state = parts.next().unwrap_or("unknown").to_string();
    let mut model = None;

    for part in parts {
      if let Some(value) = part.strip_prefix("model:") {
        model = Some(value.to_string());
      }
    }

    devices.push(DeviceInfo { id, model, state });
  }

  Ok(devices)
}

