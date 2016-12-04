import * as Actions  from '../actions';
import {Map, fromJS} from 'immutable';

const initialState = fromJS({
	viewport: {
		width: document.documentElement.clientWidth,
		height: document.documentElement.clientHeight
	}
});


const PathToObject = (path, object) => {
	path = typeof(path) === "string" ? path.split(".") : path;
	let a = {};
	let b = a;
	for (var i = 0; i < path.length - 1; ++i) {
		b[path[i]] = {};
		b = b[path[i]];
	}
	b[path[path.length - 1]] = object ? object : {};
	return a;
}

export const reducer = (state = initialState, action) =>
{
	switch (action.type) {
 		case Actions.VIEWPORT_RESIZE:
		{
			return state.mergeDeep(fromJS({ viewport: {
												width: action.width,
												height: action.height
											}}));
		}
		case Actions.OBJECT_REMOVE:
			return state.deleteIn(typeof(action.path) === "string" ? action.path.split(".") : action.path);


		case Actions.OBJECT_SET:
			return state.set(action.path, fromJS(action.object));


		case Actions.OBJECT_MERGE:
			return state.mergeDeep(fromJS(PathToObject(action.path, action.object)));

		case Actions.REQUEST_ACTION:
			return state.mergeDeep(Map([[action.scope, fromJS({fetching:true, success:null, request: action.request})]]));

		case Actions.REQUEST_SUCCESS:
		{
			if (action.options) {
				if (action.options.remove) {
					return state.delete(action.scope);
				}
			}

			let ret = fromJS({fetching:false, success:true, response:action.response});
			if (action.options) {
				if (action.options.set) {
					return state.set(action.scope, ret);
				}

				if (action.options.concat) {
					let concat = action.options.concat;
					let scope = ['response', ...(typeof(concat) === "string" ? concat.split(".") : concat)];
					let state_scope = [action.scope,...scope];

					if (state.hasIn(state_scope)) {
						let items = state.getIn(state_scope);
						if (action.options.pkAttribute) {
							ret = ret.setIn(scope, ret.getIn(scope).filterNot((a)=>{
								return items.find((b)=>{
									return a.get(action.options.pkAttribute) === b.get(action.options.pkAttribute)});
							}));
						}

						ret = ret.setIn(scope, state.getIn(state_scope).concat(ret.getIn(scope)));
					}
				}
			}
			return state.merge(Map([[action.scope, ret]]));
		}

		case Actions.REQUEST_ERROR:
			return state.merge(Map([[action.scope, fromJS({success:false,fetching:false,  error:action.error})]]));

		case  Actions.LIST_ITEM_UPDATE:
		{
			let path = typeof(action.path) === "string" ? action.path.split(".") : action.path;
			if (!state.hasIn(path)) {
				return state;
			}

			let list = state.getIn(path).map((item) => {
				if (item.get(action.pkAttribute) === action.object[action.pkAttribute]) {
					return item.mergeDeep(fromJS(action.object));
				}
				return item;
			});
			return state.setIn(path, list);
		}

		case  Actions.LIST_ITEM_REMOVE:
		{
			let path = typeof(action.path) === "string" ? action.path.split(".") : action.path;
			if (!state.hasIn(path)) {
				return state;
			}
			return state.setIn(path, state.getIn(path).filterNot((item) => {
				return item.get(action.pkAttribute) === action.pkValue;
			}));
		}

		case Actions.LIST_ITEM_ADD:
		{
			let path = typeof(action.path) === "string" ? action.path.split(".") : action.path;
			if (!state.hasIn(path)) {
				return state;
			}
			return state.setIn(path, state.getIn(path).push(fromJS(action.object)));
		}
		default:
			return state;
	}
}