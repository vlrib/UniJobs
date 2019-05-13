package com.beesocial.unijobs.activities;

import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.util.Patterns;
import android.view.View;
import android.widget.EditText;

import com.beesocial.unijobs.R;
import com.beesocial.unijobs.api.Api;
import com.beesocial.unijobs.api.RetrofitClient;
import com.beesocial.unijobs.models.CheckNetwork;
import com.beesocial.unijobs.models.DefaultResponse;
import com.beesocial.unijobs.models.LoginResponse;
import com.beesocial.unijobs.models.User;
import com.beesocial.unijobs.models.UserLogin;
import com.beesocial.unijobs.storage.SharedPrefManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class LoginActivity extends AppCompatActivity implements View.OnClickListener {
    DefaultResponse resposta = new DefaultResponse();
    UserLogin model_obj;
    User userComplete;
    CheckNetwork checkNetwork;
    Snackbar snackbar;
    private EditText editTextEmail;
    private EditText editTextPassword;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        editTextEmail = findViewById(R.id.editTextEmail);
        editTextPassword = findViewById(R.id.editTextPassword);

        findViewById(R.id.buttonLogin).setOnClickListener(this);
        findViewById(R.id.textViewRegister).setOnClickListener(this);

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


    private void userLogin(final View v) {
        final String email = editTextEmail.getText().toString().trim();
        String password = editTextPassword.getText().toString().trim();

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
        callBackend(v, email, password);
        
    }

    private void callBackend(final View v, String email, String password) {
        model_obj = new UserLogin(email, password);

        Call<LoginResponse> call = RetrofitClient
                .getInstance().getApi().userLogin(model_obj);

        call.enqueue(new Callback<LoginResponse>() {

            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                try {
                    LoginResponse loginResponse = response.body();
                    loginResponse.getToken();
                    //Toast.makeText(LoginActivity.this, loginResponse.getToken(), Toast.LENGTH_LONG).show();

                    Retrofit retrofit = new Retrofit.Builder()
                            .baseUrl("https://micro-unijobs-user.felipetiagodecarli.now.sh/api/")
                            .addConverterFactory(GsonConverterFactory.create())
                            .build();
                    Api client = retrofit.create(Api.class);
                    Call<DefaultResponse> calltargetResponce = client.getUser(loginResponse.getToken());
                    calltargetResponce.enqueue(new Callback<DefaultResponse>() {
                        @Override
                        public void onResponse(Call<DefaultResponse> calltargetResponce, retrofit2.Response<DefaultResponse> responsee) {
                            DefaultResponse UserResponse = responsee.body();
                            Log.d("respostaLogin", "Login ");
                            Log.d("respostaLogin", UserResponse.getEmail());
                            userComplete = new User(UserResponse.getId(), UserResponse.getEmail(), UserResponse.getName(), UserResponse.getImage(), UserResponse.getPassword());
                            Log.d("respostaLogin", userComplete.getEmail());
                            SharedPrefManager.getInstance(LoginActivity.this).saveUser(userComplete);
                            Intent intent = new Intent(LoginActivity.this, ProfileActivity.class);
                            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                            startActivity(intent);
                        }

                        @Override
                        public void onFailure(Call<DefaultResponse> calltargetResponce, Throwable t) {
                            snackbar = Snackbar
                                    .make(v, "Erro na conexão com o servidor, tente novamente", Snackbar.LENGTH_LONG);
                            snackbar.show();
                        }
                    });
                    Log.d("tokeee", loginResponse.getToken());
                    //Toast.makeText(LoginActivity.this, loginResponse.getError(), Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    checkNetwork = new CheckNetwork();
                    if (checkNetwork.haveNetworkConnection(LoginActivity.this)) {
                        if (response.code() == 404) {
                            snackbar = Snackbar
                                    .make(v, "Email não cadastrado", Snackbar.LENGTH_LONG);
                            snackbar.show();
                        }
                        if (response.code() == 400) {
                            snackbar = Snackbar
                                    .make(v, "Senha incorreta", Snackbar.LENGTH_LONG);
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
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                snackbar = Snackbar
                        .make(v, "Erro na conexão com o servidor, tente novamente", Snackbar.LENGTH_LONG);
                snackbar.show();
            }
        });
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.buttonLogin:
                userLogin(v);
                break;
            case R.id.textViewRegister:
                startActivity(new Intent(this, MainActivity.class));
                break;
        }
    }


}
