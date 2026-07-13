'use strict';

import React from 'react';
import {createRoot} from 'react-dom/client';
import {SiteHeader} from '../components/common/SiteHeader';
import {LoginArea, SignupArea} from "../components/common/loginElements";


const page = (
	<>
		<SiteHeader />
		<main>
			<p id="welcomeText"> Welcome to FlaskReactor, where you can play games online with your friends. All features will be free of charge for everyone, forever. Please sign up or log in to get started! Or to spectate others' games, simply visit that game's URL. </p>
			<LoginArea/>
			<br/><br/>
			<SignupArea/>
		</main>
	</>
);

const rootElement = document.getElementById("root");
const reactRoot = createRoot(rootElement);
reactRoot.render(page);