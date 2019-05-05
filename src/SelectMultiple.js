import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ListView,
  Text,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import styles from './SelectMultiple.styles';
import checkbox from '../images/icon-checkbox.png';
import checkboxChecked from '../images/icon-checkbox-checked.png';
import { mergeStyles } from './style';

const itemType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({ content: PropTypes.any, id: PropTypes.any }),
]);

const styleType = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.number,
  PropTypes.array,
]);

const sourceType = PropTypes.oneOfType([PropTypes.object, PropTypes.number]);

// A customiseable ListView that allows you to select multiple rows
export default class SelectMultiple extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(itemType).isRequired,
    selectedItems: PropTypes.arrayOf(itemType),

    onSelectionsChange: PropTypes.func.isRequired,

    checkboxSource: sourceType,
    selectedCheckboxSource: sourceType,
    renderLabel: PropTypes.func,
    listViewProps: PropTypes.any,
    style: styleType,
    rowStyle: styleType,
    checkboxStyle: styleType,
    labelStyle: styleType,

    selectedRowStyle: styleType,
    selectedCheckboxStyle: styleType,
    selectedLabelStyle: styleType,
  };

  static defaultProps = {
    selectedItems: [],
    style: {},
    rowStyle: {},
    checkboxStyle: {},
    checkboxCheckedStyle: {},
    labelStyle: {},
    checkboxSource: checkbox,
    selectedCheckboxSource: checkboxChecked,
    renderLabel: null,
  };

  constructor(props) {
    super(props);

    const rows = this.getRowData(props);

    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1.id !== r2.id || r1.selected !== r2.selected,
    }).cloneWithRows(rows);

    this.state = { dataSource };
  }

  componentWillReceiveProps(nextProps) {
    const rows = this.getRowData(nextProps);
    const dataSource = this.state.dataSource.cloneWithRows(rows);
    this.setState({ dataSource });
  }

  getRowData({ items, selectedItems }) {
    items = items.map(this.toLabelValueObject);
    selectedItems = (selectedItems || []).map(this.toLabelValueObject);

    items.forEach(item => {
      item.selected = selectedItems.some(i => i.id === item.id);
    });

    return items;
  }

  onRowPress(row) {
    const { content, id } = row;
    let { selectedItems } = this.props;

    selectedItems = (selectedItems || []).map(this.toLabelValueObject);

    const index = selectedItems.findIndex(
      selectedItem => selectedItem.id === id
    );

    if (index > -1) {
      selectedItems = selectedItems.filter(
        selectedItem => selectedItem.id !== id
      );
    } else {
      selectedItems = selectedItems.concat({ content, id });
    }

    this.props.onSelectionsChange(selectedItems, { content, id });
  }

  toLabelValueObject(obj) {
    if (Object.prototype.toString.call(obj) === '[object String]') {
      return { content: obj, id: obj };
    } else {
      return { content: obj.content, id: obj.id };
    }
  }

  render() {
    const { dataSource } = this.state;
    const { style, listViewProps } = this.props;
    const { renderItemRow } = this;
    return (
      <ListView
        style={style}
        dataSource={dataSource}
        renderRow={renderItemRow}
        {...listViewProps || {}}
      />
    );
  }

  renderLabel = (content, style, selected) => {
    if (this.props.renderLabel) {
      return this.props.renderLabel(content, style, selected);
    }
    return (
      <Text numberOfLines={2} style={style}>
        {content}
      </Text>
    );
  };

  renderItemRow = row => {
    let { checkboxSource, rowStyle, labelStyle, checkboxStyle } = this.props;

    const {
      selectedCheckboxSource,
      selectedRowStyle,
      selectedCheckboxStyle,
      selectedLabelStyle,
    } = this.props;

    if (row.selected) {
      checkboxSource = selectedCheckboxSource;
      rowStyle = mergeStyles(styles.row, rowStyle, selectedRowStyle);
      checkboxStyle = mergeStyles(
        styles.checkbox,
        checkboxStyle,
        selectedCheckboxStyle
      );
      labelStyle = mergeStyles(styles.label, labelStyle, selectedLabelStyle);
    } else {
      rowStyle = mergeStyles(styles.row, rowStyle);
      checkboxStyle = mergeStyles(styles.checkbox, checkboxStyle);
      labelStyle = mergeStyles(styles.label, labelStyle);
    }

    return (
      <TouchableWithoutFeedback onPress={() => this.onRowPress(row)}>
        <View style={rowStyle}>
          <Image style={checkboxStyle} source={checkboxSource} />
          {this.renderLabel(row.content, labelStyle, row.selected)}
        </View>
      </TouchableWithoutFeedback>
    );
  };
}
