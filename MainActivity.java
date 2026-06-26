import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.myWebView);
        
        // জাভাস্ক্রিপ্ট ইনেবল করার জন্য (অনেকের সাইটে এটা লাগে)
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        // এই লাইনটি অত্যন্ত গুরুত্বপূর্ণ, এটি বাইরের ব্রাউজারে যাওয়া আটকায়
        webView.setWebViewClient(new WebViewClient());

        // এখানে আপনার পছন্দের ওয়েবসাইটের লিঙ্কটি দিন
        webView.loadUrl("https://google.com");
    }

    // ব্যাক বাটন চাপলে যাতে অ্যাপ বন্ধ না হয়ে ব্রাউজারের আগের পেজে ফিরে যায়
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
