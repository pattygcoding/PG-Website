import type { ComponentType } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Location, NavigateFunction, Params } from "react-router-dom";

export interface RouterProps {
	location: Location;
	navigate: NavigateFunction;
	params: Params<string>;
}

function withRouter<P extends object>(Component: ComponentType<P & RouterProps>): ComponentType<P> {
	function ComponentWithRouterProp(props: P) {
		const location = useLocation();
		const navigate = useNavigate();
		const params = useParams();
		return (
			<Component
				{...props}
				location={location}
				params={params}
				navigate={navigate}
			/>
		);
	}

	return ComponentWithRouterProp;
}

export default withRouter;