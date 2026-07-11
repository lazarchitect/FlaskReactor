'use strict';

import React from 'react';
import {createRoot} from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';
import {LoginArea, SignupArea} from "../components/common/loginElements";


const page = (
	<>
		<SiteHeader />
		<main>
			<p>FlaskReactor is a site for playing games online with your friends. Gaming will be free of charge for everyone, forever. Please make an account to get started!</p>
			<LoginArea/>
			<br/><br/>
			<SignupArea/>
		</main>
	</>
);

const rootElement = document.getElementById("root");
const reactRoot = createRoot(rootElement);
reactRoot.render(page);