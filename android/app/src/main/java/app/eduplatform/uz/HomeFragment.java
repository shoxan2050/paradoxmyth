package app.eduplatform.uz;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

public class HomeFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        // fragment_home.xml faylida 'rvLessons' ID-li RecyclerView mavjud emasligi sababli xatolik yuz berayotgan edi.
        // Hozircha faqat layoutni inflate qilamiz.
        return inflater.inflate(R.layout.fragment_home, container, false);
    }
}
