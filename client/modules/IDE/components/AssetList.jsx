import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import prettyBytes from 'pretty-bytes';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types'; // Import PropTypes

import Loader from '../../App/components/loader';
import * as AssetActions from '../actions/assets';
import DownFilledTriangleIcon from '../../../images/down-filled-triangle.svg';

function AssetListRowBase(props) {
  const [isFocused, setIsFocused] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const onFocusComponent = () => {
    setIsFocused(true);
  };

  const closeOptions = () => {
    setOptionsOpen(false);
  };

  const onBlurComponent = () => {
    setIsFocused(false);
    setTimeout(() => {
      if (!isFocused) {
        closeOptions();
      }
    }, 200);
  };

  const openOptions = () => {
    setOptionsOpen(true);
  };

  const toggleOptions = () => {
    if (optionsOpen) {
      closeOptions();
    } else {
      openOptions();
    }
  };

  const handleAssetDelete = () => {
    const { key, name } = props.asset;
    closeOptions();
    if (window.confirm(props.t('Common.DeleteConfirmation', { name }))) {
      props.deleteAssetRequest(key);
    }
  };

  const { asset, username, t } = props;
  return (
    <tr className="asset-table__row" key={asset.key}>
      <th scope="row">
        <Link to={asset.url} target="_blank">
          {asset.name}
        </Link>
      </th>
      <td>{prettyBytes(asset.size)}</td>
      <td>
        {asset.sketchId && (
          <Link to={`/${username}/sketches/${asset.sketchId}`}>
            {asset.sketchName}
          </Link>
        )}
      </td>
      <td className="asset-table__dropdown-column">
        <button
          className="asset-table__dropdown-button"
          onClick={toggleOptions}
          onBlur={onBlurComponent}
          onFocus={onFocusComponent}
          aria-label={t('AssetList.ToggleOpenCloseARIA')}
        >
          <DownFilledTriangleIcon focusable="false" aria-hidden="true" />
        </button>
        {optionsOpen && (
          <ul className="asset-table__action-dialogue">
            <li>
              <button
                className="asset-table__action-option"
                onClick={handleAssetDelete}
                onBlur={onBlurComponent}
                onFocus={onFocusComponent}
              >
                {t('AssetList.Delete')}
              </button>
            </li>
            <li>
              <Link
                to={asset.url}
                target="_blank"
                onBlur={onBlurComponent}
                onFocus={onFocusComponent}
                className="asset-table__action-option"
              >
                {t('AssetList.OpenNewTab')}
              </Link>
            </li>
          </ul>
        )}
      </td>
    </tr>
  );
}

function AssetList(props) {
  useEffect(() => {
    props.getAssets();
  }, []);

  const getAssetsTitle = () => props.t('AssetList.Title');

  const hasAssets = () => !props.loading && props.assetList.length > 0;

  const renderLoader = () => {
    if (props.loading) return <Loader />;
    return null;
  };

  const renderEmptyTable = () => {
    if (!props.loading && props.assetList.length === 0) {
      return (
        <p className="asset-table__empty">
          {props.t('AssetList.NoUploadedAssets')}
        </p>
      );
    }
    return null;
  };

  const { assetList, t } = props;
  return (
    <article className="asset-table-container">
      <Helmet>
        <title>{getAssetsTitle()}</title>
      </Helmet>
      {renderLoader()}
      {renderEmptyTable()}
      {hasAssets() && (
        <table className="asset-table">
          <thead>
            <tr>
              <th>{t('AssetList.HeaderName')}</th>
              <th>{t('AssetList.HeaderSize')}</th>
              <th>{t('AssetList.HeaderSketch')}</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {assetList.map((asset) => (
              <AssetListRowBase asset={asset} key={asset.key} t={t} />
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}

// AssetListRowBase component PropTypes
AssetListRowBase.propTypes = {
  asset: PropTypes.string.isRequired,
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  sketchName: PropTypes.string.isRequired,
  sketchId: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  t: PropTypes.string.isRequired,
  deleteAssetRequest: PropTypes.string.isRequired
};

// AssetList component PropTypes
AssetList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }).isRequired,
  assetList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      sketchName: PropTypes.string,
      sketchId: PropTypes.string,
      size: PropTypes.number.isRequired
    })
  ).isRequired,
  getAssets: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    user: state.user,
    assetList: state.assets.list,
    loading: state.loading
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, AssetActions), dispatch);
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(AssetList)
);
