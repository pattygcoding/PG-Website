import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container } from "react-bootstrap";
import { Tab } from "@/components/tab";
import "./Error.css";

const Error = () => {
	return (
		<HelmetProvider>
			<Tab title="Something went wrong" />
			<main className="error-shell" aria-labelledby="error-title">
				<Container>
					<div className="error-shell__content">
						<p className="error-shell__code" aria-hidden="true">ERROR 500</p>
						<h1 id="error-title">Something went wrong</h1>
						<p className="error-shell__message">
							The page could not be loaded. Please try again later.
						</p>
					</div>
				</Container>
			</main>
		</HelmetProvider>
	);
};

export default Error;
