import React from "react";
import { Helmet } from "react-helmet-async";
import t from '@/assets/lang/en_us.json';

const Tab = ({ title }) => {
	return (
		<Helmet>
			<meta charSet="utf-8" />
			<title> {title} - {t.tab.title}</title>
			<meta name="description" content={t.tab.description} />
		</Helmet>
	);
};

export default Tab;