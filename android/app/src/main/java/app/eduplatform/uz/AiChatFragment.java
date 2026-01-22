package app.eduplatform.uz;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class AiChatFragment extends Fragment {

    private EditText etMessage;
    private ImageButton btnSend;
    private RecyclerView rvChat;
    private final OkHttpClient client = new OkHttpClient();
    private static final String API_KEY = "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";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_ai_chat, container, false);

        etMessage = view.findViewById(R.id.etMessage);
        btnSend = view.findViewById(R.id.btnSend);
        rvChat = view.findViewById(R.id.rvChat);

        rvChat.setLayoutManager(new LinearLayoutManager(getContext()));

        btnSend.setOnClickListener(v -> {
            String message = etMessage.getText().toString().trim();
            if (!message.isEmpty()) {
                sendMessageToAi(message);
                etMessage.setText("");
            }
        });

        return view;
    }

    private void sendMessageToAi(String message) {
        // Native AI so'rovi (OpenRouter)
        JSONObject json = new JSONObject();
        try {
            json.put("model", "google/gemini-2.0-flash-exp:free");
            JSONArray messages = new JSONArray();
            JSONObject msg = new JSONObject();
            msg.put("role", "user");
            msg.put("content", message);
            messages.put(msg);
            json.put("messages", messages);
        } catch (Exception e) { e.printStackTrace(); }

        RequestBody body = RequestBody.create(json.toString(), MediaType.get("application/json; charset=utf-8"));
        Request request = new Request.Builder()
                .url("https://openrouter.ai/api/v1/chat/completions")
                .header("Authorization", "Bearer " + API_KEY)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                getActivity().runOnUiThread(() -> Toast.makeText(getContext(), "Xatolik yuz berdi", Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    try {
                        String responseData = response.body().string();
                        JSONObject jsonObject = new JSONObject(responseData);
                        String aiMessage = jsonObject.getJSONArray("choices").getJSONObject(0).getJSONObject("message").getString("content");
                        
                        getActivity().runOnUiThread(() -> {
                            // Bu yerda AI javobini UI-ga chiqaramiz
                            Toast.makeText(getContext(), "AI: " + aiMessage, Toast.LENGTH_LONG).show();
                        });
                    } catch (Exception e) { e.printStackTrace(); }
                }
            }
        });
    }
}
