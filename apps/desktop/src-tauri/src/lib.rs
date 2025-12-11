mod adb;
mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      commands::tauri_list_devices,
      commands::tauri_list_apps,
      commands::tauri_get_metrics,
      commands::tauri_set_adb_path
    ])
    .setup(|app| {
      if let Some(window) = app.get_webview_window("main") {
        #[cfg(target_os = "macos")]
        {
          // macOS: 使用 Overlay 样式，保留原生按钮
          let _ = window.set_title_bar_style(tauri::TitleBarStyle::Overlay);
        }
        
        #[cfg(target_os = "windows")]
        {
          // Windows: 禁用原生装饰，使用自定义标题栏
          let _ = window.set_decorations(false);
        }
      }

      // 在所有构建中启用日志，包括生产版本
      app.handle().plugin(
        tauri_plugin_log::Builder::default()
          .level(log::LevelFilter::Info)
          .build(),
      )?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
