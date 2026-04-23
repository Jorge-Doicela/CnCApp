package ec.gob.cnc.app;
 
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import com.getcapacitor.BridgeActivity;
 
public class MainActivity extends BridgeActivity {
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Fix for Camera/Media permissions in WebView
        this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                MainActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }
        });
    }

    @Override
    public void onBackPressed() {
        // Llamamos a una función global en el WebView
        if (this.bridge != null) {
            this.bridge.getWebView().post(new Runnable() {
                @Override
                public void run() {
                    bridge.getWebView().evaluateJavascript("if(window.onNativeBack) window.onNativeBack();", null);
                }
            });
        }
    }
}
