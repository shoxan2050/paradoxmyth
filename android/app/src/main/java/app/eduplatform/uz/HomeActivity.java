package app.eduplatform.uz;

import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.fragment.app.Fragment;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationView;

public class HomeActivity extends AppCompatActivity {

    private DrawerLayout drawerLayout;
    private BottomNavigationView bottomNav;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        drawerLayout = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);
        bottomNav = findViewById(R.id.bottom_navigation);
        
        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> drawerLayout.openDrawer(GravityCompat.START));

        View headerView = navigationView.getHeaderView(0);
        View closeBtn = headerView.findViewById(R.id.btnCloseDrawer);
        if (closeBtn != null) {
            closeBtn.setOnClickListener(v -> drawerLayout.closeDrawer(GravityCompat.START));
        }

        if (savedInstanceState == null) {
            loadFragment(new HomeFragment());
            bottomNav.setSelectedItemId(R.id.nav_dashboard);
        }

        bottomNav.setOnItemSelectedListener(item -> {
            Fragment selectedFragment = null;
            int itemId = item.getItemId();

            if (itemId == R.id.nav_dashboard) {
                selectedFragment = new HomeFragment();
            } else if (itemId == R.id.nav_paths) {
                selectedFragment = new HomeFragment(); // Hozircha HomeFragment
            } else if (itemId == R.id.nav_tests) {
                selectedFragment = new AiChatFragment();
            } else if (itemId == R.id.nav_profile) {
                selectedFragment = new ProfileFragment();
            }

            if (selectedFragment != null) {
                loadFragment(selectedFragment);
            }
            return true;
        });

        navigationView.setNavigationItemSelectedListener(item -> {
            int itemId = item.getItemId();
            Fragment selectedFragment = null;

            if (itemId == R.id.nav_dashboard) {
                selectedFragment = new HomeFragment();
                bottomNav.setSelectedItemId(R.id.nav_dashboard);
            } else if (itemId == R.id.nav_paths) {
                selectedFragment = new HomeFragment(); // Kelgusida PathsFragment
                bottomNav.setSelectedItemId(R.id.nav_paths);
            } else if (itemId == R.id.nav_my_lessons) {
                selectedFragment = new HomeFragment(); // Kelgusida LessonsFragment
            } else if (itemId == R.id.nav_results) {
                selectedFragment = new HomeFragment(); // Kelgusida ResultsFragment
            } else if (itemId == R.id.nav_achievements) {
                selectedFragment = new HomeFragment(); // Kelgusida AchievementsFragment
            } else if (itemId == R.id.nav_settings) {
                selectedFragment = new ProfileFragment(); // Sozlamalar uchun Profile
                bottomNav.setSelectedItemId(R.id.nav_profile);
            } else if (itemId == R.id.nav_logout) {
                new SessionManager(getApplicationContext()).setLogin(false, "");
                finish();
            }

            if (selectedFragment != null) {
                loadFragment(selectedFragment);
            }
            
            drawerLayout.closeDrawer(GravityCompat.START);
            return true;
        });
    }

    private void loadFragment(Fragment fragment) {
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .commit();
    }

    @Override
    public void onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }
}
