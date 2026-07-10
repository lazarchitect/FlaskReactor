import logging
import os

import resend


def sendPasswordResetEmail(to_addr, reset_URL):
	resend.api_key = os.environ.get('resend_api_key')
	params = {
		"from": "FlaskReactor <pw_reset@flaskreactor.net>",
		"to": to_addr,
		"subject": "Official Password Reset Link",
		"html": f"""Hello,<br/><br/>
				The following link will allow you to reset your FlaskReactor account password: <a href={reset_URL}>{reset_URL}</a>
				<br/><br/>
				This custom link will only remain active for 15 minutes, and will only work once. 
				If you did not initiate a password reset, disregard the link. Someone else may be attempting to access your account.
				<br/><br/>
				This message was sent from an send-only mailbox, so please do not reply to this email.<br/>
				Thanks, Official FlaskReactor Team"""
	}
	email = resend.Emails.send(params)
	logging.log(1, email)