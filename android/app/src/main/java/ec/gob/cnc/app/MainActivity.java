package ec.gob.cnc.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

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

