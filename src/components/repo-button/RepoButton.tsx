import React from "react";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import { useLang } from "@/lang/languageContext";
import "./RepoButton.css";

const repoPath = (url: string): string => url.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\/(tree|blob)\/.*$/, "").replace(/\/$/, "");

interface RepoButtonProps {
	href: string;
}

const RepoButton = ({ href }: RepoButtonProps) => {
	const { t } = useLang();

	return (
		<a className="repo-button" href={href} target="_blank" rel="noopener noreferrer">
			<span className="repo-button__icon" aria-hidden="true"><FiGithub /></span>
			<span className="repo-button__text">
				<span className="repo-button__label">{t("repo_button.label")}</span>
				<span className="repo-button__path">{repoPath(href)}</span>
			</span>
			<FiArrowUpRight className="repo-button__arrow" aria-hidden="true" />
		</a>
	);
};

export default RepoButton;
