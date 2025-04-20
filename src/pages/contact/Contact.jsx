import React, { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import t from '@/assets/lang/en_us.json';
import "./Contact.css";

const Contact = () => {
	const [formData, setFormdata] = useState({
		email: "",
		name: "",
		message: "",
		loading: false,
		show: false,
		alertmessage: "",
		variant: "",
	});

	return (
		<HelmetProvider>
			<Container>
				<Tab title={t.contact.title} />
				<PageTitle title={t.contact.title} />
				<Row className="sec_sp">
					<Col lg="12">
						<Alert
							variant={formData.variant}
							className={`rounded-0 co_alert ${formData.show ? "d-block" : "d-none"
								}`}
							onClose={() => setFormdata({ show: false })}
							dismissible
						>
							<p className="my-0">{formData.alertmessage}</p>
						</Alert>
					</Col>
					<Col lg="5" className="mb-5">
						<h3 className="color_sec py-4">{t.contact.header}</h3>
						<address>
							<strong>Email:</strong>{" "}
							<a href={`mailto:${t.contact.email}`}>
								{t.contact.email}
							</a>
							<br />
							<br />
						</address>
						<p>{t.contact.description}</p>
					</Col>
				</Row>
			</Container>
			<div className={formData.loading ? "loading-bar" : "d-none"}></div>
		</HelmetProvider>
	);
};

export default Contact;