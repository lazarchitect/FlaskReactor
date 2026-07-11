import React from "react";

export function InputError({message}) {
    return <span style={{color: "red", marginTop: "0", marginBottom: "0"}}>{message}</span>;
}

function ResetPasswordModal() {
    const [submitSuccess, setSubmitSuccess] = React.useState(false);
    const message = submitSuccess ?
        "Check your email on file for a link to reset your password. The link will deactivate after 15 minutes." :
        "Enter your username here to send a reset link to the email on file, if you provided an email address during sign up."
    const bye = () => document.getElementById("forgotPasswordModal").classList.remove('active');

    return <div id="forgotPasswordModal">
        <div className="closeX" onClick={bye}>X</div>
        <span>{message}</span>
        <br/><br/>
        {!submitSuccess &&
            <form onSubmit={(e)=>e.preventDefault()}>
                Username: <input id="forgotPasswordUsername"/>
                <input type="submit" value="Submit" onClick={() => {requestPasswordReset(setSubmitSuccess)}}/>
                <br/><br/>
            </form>
        }
    </div>
}

export function LoginArea() {

    function enableSubmitButton() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const hasUsername = username.length > 0;
        const hasPassword = password.length > 8;

        const allConditionsMet = hasUsername && hasPassword;
        document.getElementById('loginSubmit').disabled = false;//!allConditionsMet;
    }

    return <div>
        <h1>Log In</h1>
        <form id="loginForm" action="/login" method="POST">
            <label>
                Username:
                <input type="text" id="loginUsername" name="username" autoComplete="username"
                       onKeyUp={enableSubmitButton}/>
            </label>
            <br/><br/>
            <label>
                Password:
                <input type="password" id="loginPassword" name="password" autoComplete='current-password'
                       onKeyUp={enableSubmitButton}/>
            </label>
            <br/><br/>
            <input type="submit" id="loginSubmit" value="Log In" disabled/>
        </form>
        <span id="forgotPasswordText" onClick={() => {document.getElementById("forgotPasswordModal").classList.add('active');}}>
            (Forgot password?)
        </span>
        <ResetPasswordModal/>
    </div>
}

export function SignupArea() {

    let [showPasswordTooShortError, setShowPasswordTooShortError] = React.useState(false);
    let [showPasswordsDontMatchError, setShowPasswordsDontMatchError] = React.useState(false);

    function displayWarnings() {
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const repeated = document.getElementById('signupRepeated').value;
        const hasUsername = username.length > 0;
        const hasPassword = password.length > 8;
        const passwordsMatch = password === repeated;

        const allConditionsMet = hasUsername && hasPassword && passwordsMatch;
        document.getElementById('signupSubmit').disabled = !allConditionsMet;

        setShowPasswordTooShortError(password.length > 0 && password.length <= 8);
        setShowPasswordsDontMatchError(!passwordsMatch && password.length > 0 && repeated.length > 0);

    }

    function removeWarnings() {
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const repeated = document.getElementById('signupRepeated').value;
        const hasUsername = username.length > 0;
        const hasPassword = password.length > 8;
        const passwordsMatch = password === repeated;
        if (password.length > 8) setShowPasswordTooShortError(false);
        if (passwordsMatch) setShowPasswordsDontMatchError(false);
        const allConditionsMet = hasUsername && hasPassword && passwordsMatch;
        document.getElementById('signupSubmit').disabled = !allConditionsMet;
    }

    return <div>
        <h1>Sign Up</h1>
        <form action="/signup" method="POST">
            <label>
                Username:
                <input type="text" id="signupUsername" name="username" autoComplete="username"/>
            </label><br/>
            <label>
                Password:
                <input type="password" id="signupPassword" name="password" autoComplete="new-password"
                       onBlur={displayWarnings} onKeyUp={removeWarnings}/>
            </label>
            {showPasswordTooShortError && <InputError message="Passwords must be longer than 8 characters."/>}
            <br/>
            <label>
                Repeat Password:
                <input type="password" id="signupRepeated" name="password_repeat" autoComplete="new-password"
                       onBlur={displayWarnings} onKeyUp={removeWarnings}/>
            </label>
            {!showPasswordTooShortError && showPasswordsDontMatchError && <InputError message="Passwords must match."/>}
            <br/>
            <label>
                Email (optional):
                <input type="email" name="email" autoComplete="email"/> (needed only for password recovery)
            </label>
            <br/><br/>
            <input type="submit" id="signupSubmit" value="Sign Up" disabled/>
        </form>
    </div>
}

function requestPasswordReset(setSubmitSuccess) {
    fetch("/request_password_reset", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            "username": document.getElementById("forgotPasswordUsername").value
        })
    }).then(async response => {
        if (response.statusText !== "OK") alert(await response.text());
        else setSubmitSuccess(true);
    });
}