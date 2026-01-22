package app.eduplatform.uz;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import java.util.HashMap;
import java.util.Map;

public class RegisterActivity extends AppCompatActivity {

    private EditText etName, etEmail, etPassword;
    private RadioGroup rgRole;
    private Button btnRegister;
    private TextView tvLoginLink;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;
    private SessionManager session;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();
        session = new SessionManager(this);

        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        rgRole = findViewById(R.id.rgRole);
        btnRegister = findViewById(R.id.btnRegister);
        tvLoginLink = findViewById(R.id.tvLoginLink);

        btnRegister.setOnClickListener(v -> {
            String name = etName.getText().toString().trim();
            String email = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString().trim();
            String role = ((RadioButton) findViewById(rgRole.getCheckedRadioButtonId())).getText().toString();

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Hamma maydonlarni to'ldiring", Toast.LENGTH_SHORT).show();
                return;
            }

            registerUser(name, email, password, role);
        });

        tvLoginLink.setOnClickListener(v -> finish());
    }

    private void registerUser(String name, String email, String password, String role) {
        mAuth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        String uid = mAuth.getCurrentUser().getUid();
                        saveUserToFirestore(uid, name, email, role);
                    } else {
                        Toast.makeText(this, "Xatolik: " + task.getException().getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
    }

    private void saveUserToFirestore(String uid, String name, String email, String role) {
        Map<String, Object> user = new HashMap<>();
        user.put("name", name);
        user.put("email", email);
        user.put("role", role);

        db.collection("users").document(uid)
                .set(user)
                .addOnSuccessListener(aVoid -> {
                    session.setLogin(true, email);
                    Toast.makeText(this, "Muvaffaqiyatli ro'yxatdan o'tdingiz", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(this, HomeActivity.class));
                    finishAffinity();
                })
                .addOnFailureListener(e -> Toast.makeText(this, "Baza bilan xatolik: " + e.getMessage(), Toast.LENGTH_SHORT).show());
    }
}
