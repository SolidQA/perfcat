use std::collections::HashSet;

use crate::adb::{command::run_device, error::Result, AppInfo};

pub fn list_apps(device_id: &str, keyword: Option<&str>) -> Result<Vec<AppInfo>> {
  let keyword = keyword.map(|k| k.to_ascii_lowercase());
  let mut seen = HashSet::new();
  let mut apps = Vec::new();

  for (args, is_system) in [
    (["shell", "pm", "list", "packages", "-3"], false), // 第三方安装应用
    (["shell", "pm", "list", "packages", "-s"], true),  // 系统应用
  ] {
    let raw = run_device(device_id, &args)?;
    for pkg in raw.lines().filter_map(|line| line.strip_prefix("package:")) {
      let pkg_lower = pkg.to_ascii_lowercase();
      if let Some(k) = &keyword {
        if !pkg_lower.contains(k) {
          continue;
        }
      }
      if !seen.insert(pkg.to_string()) {
        continue;
      }
      apps.push(AppInfo {
        package: pkg.to_string(),
        label: None,
        is_system,
      });
    }
  }

  Ok(apps)
}


