import React from "react";
import t from '@/assets/lang/en_us.json';

interface TabProps {
	title: string;
}

// React 19 hoists <title>/<meta> rendered anywhere in the tree into <head>, so
// page components set their own document metadata without react-helmet-async.
const Tab = ({ title }: TabProps) => {
	return (
		<>
			<title>{`${title} - ${t.tab.title}`}</title>
			<meta name="description" content={t.tab.description} />
		</>
	);
};

export default Tab;