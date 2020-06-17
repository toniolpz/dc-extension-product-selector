import React, { useState } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';
import { makeStyles, CircularProgress, Paper, Typography, Box } from '@material-ui/core';

import { reorderItems } from '../store/selectedItems/selectedItems.actions';

import Sortable from 'react-sortablejs';
import FadeIn from '../fade-in/FadeIn';
import Product from '../product/Product';
import FormError from '../form-error/FormError';

import './selected-products.scss';

const styles = makeStyles(theme => ({
  root: {
    width: '100%',
    minHeight: '200px',
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  dragItem: {
    transition: 'flex 0.15s, opacity 0.15s'
  },
  title: {
    fontWeight: 700
  },
  items: {
    margin: 'auto',
    width: '100%',
    zIndex: 2,
    display: 'grid',
    gridTemplateColumns: '100%',
    '@media(min-width: 450px)': {
      gridTemplateColumns: '50% 50%'
    },
    '@media(min-width: 800px)': {
      gridTemplateColumns: '25% 25% 25% 25%'
    },
    '@media(min-width: 1024px)': {
      gridTemplateColumns: '20% 20% 20% 20% 20%'
    }
  },
  errorWrapper: {
    height: '20px',
    marginTop: 'auto'
  },
  loader: {
    margin: 'auto',
    alignSelf: 'center'
  },
  placeholder: {
    margin: '-12px 0 0 0',
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    top: '50%'
  }
}));

export const SelectedProductsComponent = params => {
  const [isDragging, setDragging] = useState(false);
  const { minItems, maxItems } = get(params.SDK, 'field.schema', {});
  const { readOnly } = get(params.SDK, 'form', {});
  const classes = styles({ readOnly });
  const showMinItemError = params.touched && minItems && params.selectedItems.length < minItems;
  const showMaxItemError = params.touched && maxItems && params.selectedItems.length > maxItems;

  const items = params.selectedItems.length ? (
    <ProductList selectedItems={params.selectedItems} classes={classes} isDragging={isDragging}/>
  ) : (
    <NoItems classes={classes} noItemsText={params.params.noItemsText} />
  );

  return (
    <Paper className={'selected-products ' + classes.root}>
      <Typography variant="subtitle1" component="h2" className={classes.title}>
        {get(params.SDK, 'field.schema.title', 'Selected products')}
      </Typography>

      <Loading show={!params.initialised} className={classes.loader} />

      <FadeIn show={params.initialised}>
        {readOnly && <div className={classes.items}>{items}</div>}
        {!readOnly && (
          <Sortable
            onChange={(_, sortable, indexes) => params.reorderItems(indexes)}
            className={classes.items}
            options={{
              animation: 150,
              ghostClass: 'product-placeholder',
              onStart: () => setDragging(true),
              onEnd: () => setDragging(false)
            }}
          >
            {items}
          </Sortable>
        )}
        
      </FadeIn>

      <div className={classes.errorWrapper}>
        <FormError show={Boolean(showMinItemError)}>You must select a minimum of {minItems} items</FormError>
        <FormError show={Boolean(showMaxItemError)}>You must select a maximum of {maxItems} items</FormError>
      </div>
    </Paper>
  );
};

const ProductList = ({ selectedItems, classes, isDragging }) => {
  return selectedItems.map(item => (
    <motion.div positionTransition={isDragging ? null : {type: 'tween'}} key={item.id}>
      <Product className={classes.dragItem} item={item} variant="removable" />
    </motion.div>
  ));
};

const Loading = ({ show, className }) => (
  <FadeIn
    show={show}
    className={className}
    exitOptions={{position: 'absolute', zIndex: 3, top: '50%', marginTop: '-20px'}}
  >
    <CircularProgress />
  </FadeIn>
);

const NoItems = ({ classes, noItemsText }) => (
  <Typography component="div" variant="body1" className={classes.placeholder}>
    <Box fontWeight="fontWeightLight">{noItemsText}</Box>
  </Typography>
);

const SelectedProducts = connect(
  state => ({
    selectedItems: state.selectedItems,
    SDK: state.SDK,
    params: state.params,
    touched: state.touched,
    backend: state.backend,
    initialised: state.initialised
  }),
  { reorderItems }
)(SelectedProductsComponent);

export default SelectedProducts;
