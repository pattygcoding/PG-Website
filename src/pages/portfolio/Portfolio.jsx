import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Card } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import t from '@/assets/lang/en_us.json';
import links from '@/assets/links/links.json';
import "./Portfolio.css";

const Portfolio = () => {
	const entries = t.portfolio.entries;
	const images = links.portfolio;

	const resolveImage = (filename) => {
		try {
			return require(`@/assets/images/${filename}`);
		} catch {
			return require(`@/assets/images/logo.png`);
		}
	};

	return (
		<HelmetProvider>
			<Container className="About-header">
				<Tab title={t.portfolio.title} />
				<PageTitle title={t.portfolio.title} />
				<Row className="g-4">
					{Object.entries(entries).map(([key, data]) => (
						<Col xs={12} key={key}>
							<a
								href={data.link}
								target="_blank"
								rel="noopener noreferrer"
								className="text-decoration-none text-reset"
							>
								<Card className="d-flex flex-row align-items-center portfolio-card hover-shadow">
									<Card.Img
										src={resolveImage(images[key] || images.placeholder)}
										alt={data.title}
										className="portfolio-card-img"
									/>
									<Card.Body>
										<Card.Title className="portfolio-card-title">
											{data.title}
										</Card.Title>
										<Card.Text>{data.text}</Card.Text>
									</Card.Body>
								</Card>
							</a>
						</Col>
					))}
				</Row>
			</Container>
		</HelmetProvider>
	);
};

export default Portfolio;
