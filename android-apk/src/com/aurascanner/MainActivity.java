package com.aurascanner;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.os.Environment;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setAllowContentAccess(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        ws.setCacheMode(WebSettings.LOAD_NO_CACHE);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.grant(request.getResources());
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Allow localhost (our base URL) to load inside WebView
                if (url.contains("localhost")) {
                    return false;
                }
                // Open external URLs in browser
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                return false;
            }
        });

        webView.addJavascriptInterface(new AuraBridge(), "AuraNative");
        
        // Request camera permission at startup (Android 6+)
        requestCameraPermission();
        
        // Load HTML with localhost base URL for camera permissions
        String html = loadAssetHtml("www/index.html");
        if (html != null) {
            webView.loadDataWithBaseURL("https://localhost/", html, "text/html", "UTF-8", null);
        } else {
            webView.loadUrl("file:///android_asset/www/index.html");
        }
    }

    private String loadAssetHtml(String path) {
        try {
            InputStream is = getAssets().open(path);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            int read;
            while ((read = is.read(buffer)) != -1) {
                baos.write(buffer, 0, read);
            }
            is.close();
            return baos.toString("UTF-8");
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    // Runtime camera permission request (Android 6+)
    private void requestCameraPermission() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            if (checkSelfPermission(android.Manifest.permission.CAMERA) 
                    != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(
                    new String[]{android.Manifest.permission.CAMERA},
                    1001
                );
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == 1001) {
            if (grantResults.length > 0 && grantResults[0] == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                // Camera permission granted — notify JS if needed
                webView.evaluateJavascript("window.__cameraGranted=true", null);
            } else {
                // Permission denied — toast warning
                Toast.makeText(this, "Camera permission needed for aura scan", Toast.LENGTH_LONG).show();
            }
        }
    }

    public class AuraBridge {
        @JavascriptInterface
        public void toast(String msg) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void shareImage(String base64Data) {
            try {
                byte[] bytes = android.util.Base64.decode(base64Data.split(",")[1], android.util.Base64.DEFAULT);
                // Write to internal cache — same location provider reads from
                File file = new File(getCacheDir(), "aura-card.png");
                FileOutputStream fos = new FileOutputStream(file);
                fos.write(bytes);
                fos.close();

                Uri uri = Uri.parse("content://com.aurascanner.provider/aura-card.png");
                Intent shareIntent = new Intent(Intent.ACTION_SEND);
                shareIntent.setType("image/png");
                shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
                shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                shareIntent.putExtra(Intent.EXTRA_SUBJECT, "My Aura");
                shareIntent.putExtra(Intent.EXTRA_TEXT, "Check out my aura!");
                startActivity(Intent.createChooser(shareIntent, "Share My Aura"));
            } catch (Exception e) {
                e.printStackTrace();
                toast("Share failed: " + e.getMessage());
            }
        }
    }
}
