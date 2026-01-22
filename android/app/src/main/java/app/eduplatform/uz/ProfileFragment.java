package app.eduplatform.uz;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.firebase.auth.FirebaseAuth;

public class ProfileFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        TextView tvEmail = view.findViewById(R.id.tvProfileEmail);
        Button btnLogout = view.findViewById(R.id.btnProfileLogout);
        
        SessionManager session = new SessionManager(getContext());
        tvEmail.setText(session.getEmail());

        btnLogout.setOnClickListener(v -> {
            FirebaseAuth.getInstance().signOut();
            session.logout();
            Intent intent = new Intent(getActivity(), MainActivity.class);
            startActivity(intent);
            getActivity().finish();
        });

        return view;
    }
}
