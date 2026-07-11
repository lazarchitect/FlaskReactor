import React from "react";
import {createRoot} from "react-dom/client";
import {SiteHeader} from "../components/common/SiteHeader";
import {InputError} from "../components/common/loginElements";

function PasswordResetArea() {

    const [showPasswordTooShortError, setShowPasswordTooShortError] = React.useState(false);
    const [showPasswordsDontMatchError, setShowPasswordsDontMatchError] = React.useState(false);

    function displayErrors() {
        const password = document.getElementById('newPassword').value;
        const repeated = document.getElementById('newPasswordRepeat').value;
        const hasPassword = password.length > 8;
        const passwordsMatch = password === repeated;

        const allConditionsMet = hasPassword && passwordsMatch;
        document.getElementById('passwordResetSubmit').disabled = !allConditionsMet;

        setShowPasswordTooShortError(password.length > 0 && password.length <= 8);
        setShowPasswordsDontMatchError(!passwordsMatch && password.length > 0 && repeated.length > 0);
    }

    function removeErrors() {
        const password = document.getElementById('newPassword').value;
        const repeated = document.getElementById('newPasswordRepeat').value;
        const passwordsMatch = password === repeated;
        if (password.length > 8) setShowPasswordTooShortError(false);
        if (passwordsMatch) setShowPasswordsDontMatchError(false);
        if (password.length > 8 && passwordsMatch) document.getElementById('passwordResetSubmit').disabled = false;
    }

    function onPasswordResetSubmit(event) {

        event.preventDefault();

        const formElement = document.getElementById('passwordResetForm');
        const formData = new FormData(formElement);
        const requestObject = Object.fromEntries(formData.entries());
        requestObject["username"] = payload.tempUsername;
        requestObject["token"] = payload.token;
        console.log(requestObject);

        fetch("/confirm_password_reset", {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(requestObject)
        }).then(
            async (response) => {
                if (response.ok) alert("Password reset successfully! Please return to the home page to log in.");
                else alert("Failed to reset password: " + await response.text());
            })
    }


    return <div>
        <h1>Password Reset</h1>
        <form id="passwordResetForm" onSubmit={onPasswordResetSubmit} method="POST">
            Your Username: {payload.tempUsername}
            <br/>
            <label>
                New Password:
                <input type="password" id="newPassword" name="password" autoComplete="new-password" onBlur={displayErrors} onKeyUp={removeErrors} />
            </label>
            {showPasswordTooShortError && <InputError message="Passwords must be longer than 8 characters." />}
            <br/>
            <label>
                Repeat Password:
                <input type="password" id="newPasswordRepeat" name="password_repeat" autoComplete="new-password" onBlur={displayErrors} onKeyUp={removeErrors} />
            </label>
            {!showPasswordTooShortError && showPasswordsDontMatchError && <InputError message="Passwords must match." />}
            <br/>

            <input type="submit" id="passwordResetSubmit" value="Confirm Password Reset" disabled/>
        </form>
    </div>
}

let page = (
    <>
        <SiteHeader />
        <main>
            <PasswordResetArea />
            <a href={"/"}>Return to Home</a>
        </main>
    </>
);

createRoot(document.getElementById('root')).render(page);