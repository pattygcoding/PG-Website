import React, { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import "./Contact.css";

const Contact = () => {
	const { t } = useLang();

	return (
		<HelmetProvider>
			<Container>
				<Tab title={t("contact.title")} />
				<PageTitle title={t("contact.title")} />
				<Row className="sec_sp">
					<Col lg="5" className="mb-5">
						<h3 className="color_sec py-4">{t("contact.header")}</h3>
						<address>
							<strong>Email:</strong>{" "}
							<a href={`mailto:${t("contact.email")}`}>
								{t("contact.email")}
							</a>
							<br />
							<br />
						</address>
						<p>{t("contact.description")}</p>
					</Col>
				</Row>
			</Container>
		</HelmetProvider>
	);
};

export default Contact;
