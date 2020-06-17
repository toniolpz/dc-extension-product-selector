import { map, trim, isEmpty, get } from 'lodash';
import { setPage } from '../pages/pages.actions';
import { setFetching } from '../fetching/fetching.actions';
import { setGlobalError } from '../global-error/global-error.actions';

export const SET_VALUE = 'SET_VALUE';

export const setValue = selectedItems => async (dispatch, getState) => {
  const { SDK, backend } = getState();
  try {
    await SDK.field.setValue(map(selectedItems, item => backend.exportItem(item)));
  } catch (e) {
    const error = get(e, '[0].data.keyword');
    if (!error) {
      dispatch(setGlobalError('Could not set value'));
    }
  }
};

export const GET_ITEMS = 'GET_ITEMS';

export const getItems = () => async (dispatch, getState) => {
  const state = getState();

  if (isEmpty(trim(state.searchText))) {
    const page = {
      numPages: 0,
      curPage: 0,
      total: 0
    };
    dispatch(setPage(page));
    dispatch(setItems([]));
    return;
  }

  dispatch(setFetching(true));

  let items = [];

  try {
    const { items: fetchedItems, page } = await state.backend.search(state);
    items = fetchedItems;
    dispatch(setPage(page));
    dispatch(setItems(items));
  } catch (e) {
    dispatch(setGlobalError('Could not get items'));
    console.error(e)
  }

  dispatch(setFetching(false));
};

export const SET_ITEMS = 'SET_ITEMS';

export const setItems = value => ({
  type: SET_ITEMS,
  value
});
