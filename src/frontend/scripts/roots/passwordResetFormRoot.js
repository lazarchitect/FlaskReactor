import React from "react";
import {createRoot} from "react-dom/client";
import {SiteHeader} from "../components/common/SiteHeader";
import {InputError} from "../components/common/loginElements";

function PasswordResetArea() {

    const [passwordLength, setPasswordLength] = React.useState(0);
    const [repeatedLength, setRepeatedLength] = React.useState(0);
    const [passwordsMatch, setPasswordsMatch] = React.useState(false);

    const [passwordLengthWarning, setPasswordLengthWarning] = React.useState(false);
    const [passwordsMatchWarning, setPasswordsMatchWarning] = React.useState(false);

    document.addEventListener("keyup", () => {
        const password = document.getElementById('newPassword').value;
        const repeated = document.getElementById('newPasswordRepeat').value;
        const hasPassword = password.length > 8;
        const matchingPws = password === repeated;

        setPasswordLength(password.length);
        setRepeatedLength(repeated.length);
        setPasswordsMatch(matchingPws);

        const allConditionsMet = hasPassword && matchingPws;
        document.getElementById('passwordResetSubmit').disabled = !allConditionsMet;

        let passwordFocus = document.getElementById('newPassword') === document.activeElement;
        let repeatedFocus = document.getElementById('newPasswordRepeat') === document.activeElement;
        setPasswordLengthWarning(!passwordFocus && passwordLength > 0 && passwordLength <= 8);
        setPasswordsMatchWarning(!repeatedFocus && !passwordsMatch && passwordLength > 0 && repeatedLength > 0);
    });

    function onPasswordResetSubmit(event) {

        event.preventDefault();

        const formElement = document.getElementById('passwordResetForm');
        const requestData = new FormData(formElement);
        requestData.append("username", payload.tempUsername);
        requestData.append("token", payload.token);
        console.log([...requestData.entries()]);
        const requestObject = Object.fromEntries(requestData.entries());
        console.log(JSON.stringify(requestObject));

        fetch("/confirm_password_reset", {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(requestObject)
        }).then(
            async (response) => alert(await response.text()))
    }


    return <div>
        <h1>Password Reset</h1>
        <form id="passwordResetForm" onSubmit={onPasswordResetSubmit} method="POST">
            Your Username: {payload.tempUsername}
            <br/>
            <label>
                New Password:
                <input type="password" id="newPassword" name="password" autoComplete="new-password"/>
            </label>
            {passwordLengthWarning && <InputError message="Passwords must be longer than 8 characters." />}
            <br/>
            <label>
                Repeat Password:
                <input type="password" id="newPasswordRepeat" name="password_repeat" autoComplete="new-password"/>
            </label>
            {!passwordLengthWarning && passwordsMatchWarning && <InputError message="Passwords must match." />}
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
        </main>
    </>
);

createRoot(document.getElementById('root')).render(page);