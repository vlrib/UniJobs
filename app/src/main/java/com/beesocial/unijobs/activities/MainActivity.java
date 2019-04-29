package com.beesocial.unijobs.activities;

import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.util.Patterns;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import com.beesocial.unijobs.R;
import com.beesocial.unijobs.api.Api;
import com.beesocial.unijobs.api.RetrofitClient;
import com.beesocial.unijobs.models.CheckNetwork;
import com.beesocial.unijobs.models.DefaultResponse;
import com.beesocial.unijobs.models.LoginResponse;
import com.beesocial.unijobs.models.User;
import com.beesocial.unijobs.models.UserLogin;
import com.beesocial.unijobs.models.UserRegister;
import com.beesocial.unijobs.storage.SharedPrefManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;


public class MainActivity extends AppCompatActivity implements View.OnClickListener {
    UserRegister userRegister;
    UserLogin userLogin;
    User userComplete;
    CheckNetwork checkNetwork;
    Snackbar snackbar;
    private EditText editTextEmail, editTextPassword, editTextName, editTextImage;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        editTextEmail = findViewById(R.id.editTextEmail);
        editTextPassword = findViewById(R.id.editTextPassword);
        editTextName = findViewById(R.id.editTextName);
        editTextImage = findViewById(R.id.editTextImage);

        findViewById(R.id.buttonSignUp).setOnClickListener(this);
        findViewById(R.id.textViewLogin).setOnClickListener(this);
    }


    @Override
    protected void onStart() {
        super.onStart();
        if (SharedPrefManager.getInstance(this).isLoggedIn()) {
            Intent intent = new Intent(this, ProfileActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        }
    }

    private void userSignUp(final View v) {
        final String email = editTextEmail.getText().toString().trim();
        String password = editTextPassword.getText().toString().trim();
        String name = editTextName.getText().toString().trim();
        String image = editTextImage.getText().toString().trim();

        if (email.isEmpty()) {
            editTextEmail.setError("Campo necessário");
            editTextEmail.requestFocus();
            return;
        }

        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            editTextEmail.setError("O email precisa ser válido");
            editTextEmail.requestFocus();
            return;
        }

        if (password.isEmpty()) {
            editTextPassword.setError("Campo necessário");
            editTextPassword.requestFocus();
            return;
        }

        if (password.length() < 6) {
            editTextPassword.setError("A senha tem que ter ao mínimo 6 caracteres");
            editTextPassword.requestFocus();
            return;
        }

        if (name.isEmpty()) {
            editTextName.setError("Campo necessário");
            editTextName.requestFocus();
            return;
        }

        if (image.isEmpty()) {
            editTextImage.setError("Campo necessário");
            editTextImage.requestFocus();
            return;
        }
        userRegister = new UserRegister(email, name, password);
        userLogin = new UserLogin(email, password);

        Call<DefaultResponse> call = RetrofitClient
                .getInstance().getApi().createUser(userRegister);

        //chamada para criar o usuario
        call.enqueue(new Callback<DefaultResponse>() {
            @Override
            public void onResponse(Call<DefaultResponse> call, Response<DefaultResponse> response) {
                try {
                    DefaultResponse defaultResponse = response.body();
                    defaultResponse.getEmail();


                    Call<LoginResponse> call2 = RetrofitClient
                            .getInstance().getApi().userLogin(userLogin);
                    call2.enqueue(new Callback<LoginResponse>() {
                        @Override
                        public void onResponse(Call<LoginResponse> call2, Response<LoginResponse> response2) {
                            LoginResponse loginResponse = response2.body();
                            Toast.makeText(MainActivity.this, loginResponse.getToken(), Toast.LENGTH_LONG).show();

                            Retrofit retrofit = new Retrofit.Builder()
                                    .baseUrl("https://micro-unijobs-user.felipetiagodecarli.now.sh/api/")
                                    .addConverterFactory(GsonConverterFactory.create())
                                    .build();

                            Api client = retrofit.create(Api.class);
                            Call<DefaultResponse> calltargetResponce = client.getUser(loginResponse.getToken());
                            calltargetResponce.enqueue(new Callback<DefaultResponse>() {
                                @Override
                                public void onResponse(Call<DefaultResponse> calltargetResponce, retrofit2.Response<DefaultResponse> response3) {
                                    DefaultResponse UserResponse = response3.body();
                                    userComplete = new User(UserResponse.getId(), UserResponse.getEmail(), UserResponse.getName(), UserResponse.getImage(), UserResponse.getPassword());

                                    SharedPrefManager.getInstance(MainActivity.this).saveUser(userComplete);

                                    Intent intent = new Intent(MainActivity.this, ProfileActivity.class);
                                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                                    startActivity(intent);
                                }

                                @Override
                                public void onFailure(Call<DefaultResponse> calltargetResponce, Throwable t) {

                                }
                            });

                        }

                        @Override
                        public void onFailure(Call<LoginResponse> call2, Throwable t) {

                        }
                    });
                } catch (Exception e) {
                    checkNetwork = new CheckNetwork();
                    if (checkNetwork.haveNetworkConnection(MainActivity.this)) {
                        if (response.code() == 403) {
                            snackbar = Snackbar
                                    .make(v, "Email já cadastrado", Snackbar.LENGTH_LONG);
                            snackbar.show();
                        }
                    } else {
                        snackbar = Snackbar
                                .make(v, "Sem conexão com a internet", Snackbar.LENGTH_LONG);
                        snackbar.show();
                    }
                }
            }

            @Override
            public void onFailure(Call<DefaultResponse> call, Throwable t) {

            }
        });

    }


    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.buttonSignUp:
                userSignUp(v);
                break;
            case R.id.textViewLogin:

                startActivity(new Intent(this, LoginActivity.class));


                break;
        }
    }
}
