import React, { useState, useEffect } from 'react';
import './Tabpane.css';
import { Button, Col, Dropdown, DropdownButton, FormControl, Glyphicon, MenuItem, Nav, NavItem, Row, Tab } from 'react-bootstrap';
import ButtonGroupNav from './ButtonGroupNav';
import config from '../actions/config';
import ShowAll from './ShowAll';
import { Offline, Online } from 'react-detect-offline';

const headers = {
  headers: {
    Authorization: `Basic ${btoa(config.username + ':' + config.password)}`
  }
};

const CustomToggle = ({ onClick, children }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onClick(e);
  };

  return (
    <div>
      <Button onClick={handleClick}>
        {children}
      </Button>
    </div>
  );
};

const CustomMenu = ({ children }) => {
  const [value, setValue] = useState('');

  const handleChange = (e) => setValue(e.target.value.toLowerCase());

  const filteredChildren = React.Children.toArray(children).filter(
    (child) => !value.trim() || child.props.children[1].toLowerCase().includes(value)
  );

  return (
    <div className="dropdown-menu" style={{ maxHeight: 500, overflowY: 'auto' }}>
      <FormControl
        type="text"
        placeholder="Type to filter..."
        onChange={handleChange}
        value={value}
        style={{ margin: 10, width: '90%' }}
      />
      {filteredChildren.length > 0 ? (
        filteredChildren
      ) : (
        <div>
          <Online>
            <div style={{ color: 'red', margin: 10 }}>No groups found</div>
          </Online>
          <Offline>
            <div className="spinner">
              <div className="double-bounce1" />
              <div className="double-bounce2" />
            </div>
          </Offline>
        </div>
      )}
    </div>
  );
};

const Tabpane = () => {
  const [viewTabs, setViewTabs] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Filter');
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState('datasets');
  const [selectedId, setSelectedId] = useState('');
  const [selectedItemdd, setSelectedItemdd] = useState({ item: 1, name: 'All' });

  useEffect(() => {
    dispUrl();
  }, []);

  const dispUrl = (name = 'data') => {
    setCurrentUrl(`https://tarcker-dev.msf-waca.org/dhis/api/${name}`);
  };

  const callGroups = async (itemCalled) => {
    let apiEndpoint = '';
    switch (itemCalled) {
      case 'dataelements':
        apiEndpoint = 'dataElementGroups.json';
        break;
      case 'indicators':
        apiEndpoint = 'indicators.json';
        break;
      case 'programs':
        apiEndpoint = 'programs.json';
        break;
      case 'datasets':
        apiEndpoint = 'dataSets.json';
        break;
      default:
        setData([]);
        return;
    }

    try {
      const response = await fetch(`https://tarcker-dev.msf-waca.org/dhis/api/${apiEndpoint}?fields=:all&paging=false`, headers);
      const result = await response.json();
      setData(result.dataElementGroups || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClick = (id) => {
    const items = ['Filter', 'datasets', 'indicators', 'programs', 'dataelements'];
    setSelectedItem(items[id] || 'dataelements');
    setSelectedItemdd({ item: id, name: items[id] || 'None' });
    callGroups(items[id]);
  };

  const showAllButton = () => {
    setViewTabs(false);
    // Render logic for showAll here
  };

  const removeAllButton = () => {
    setViewTabs(true);
    setSelectedGroup('Filter');
    setSelectedItem('Filter');
    setSelectedItemdd({ item: 1, name: 'All' });
    // Clear rendered content
  };

  return (
    <div className="tabpanebody">
      <div className="container">
        <Row>
          <label style={{ marginLeft: 10 }}>Filter by Groups</label>&nbsp;
          <DropdownButton id="input-dropdown-addon" title={selectedItemdd.name}>
            <MenuItem key="nav2" onClick={() => handleClick(2)}>
              DataSets{selectedItemdd.item === 2 ? <Glyphicon glyph="ok" className="pull-right" /> : null}
            </MenuItem>
            <MenuItem key="nav3" onClick={() => handleClick(3)}>
              Indicators{selectedItemdd.item === 3 ? <Glyphicon glyph="ok" className="pull-right" /> : null}
            </MenuItem>
            <MenuItem key="nav4" onClick={() => handleClick(4)}>
              Programs{selectedItemdd.item === 4 ? <Glyphicon glyph="ok" className="pull-right" /> : null}
            </MenuItem>
            <MenuItem key="nav5" onClick={() => handleClick(5)}>
              Data Elements{selectedItemdd.item === 5 ? <Glyphicon glyph="ok" className="pull-right" /> : null}
            </MenuItem>
          </DropdownButton>&nbsp;

          <Dropdown id="dropdown-custom-menu">
            <CustomToggle>
              {selectedGroup} <span className="caret" />
            </CustomToggle>

            <CustomMenu>
              {data.map((dynamicData, key) => (
                <MenuItem
                  onClick={() => setSelectedGroup(dynamicData.name, dynamicData.id)}
                  key={key}
                >
                  {dynamicData.name}
                </MenuItem>
              ))}
            </CustomMenu>
          </Dropdown>&nbsp;

          {viewTabs && selectedGroup !== 'Filter' ? (
            <Button onClick={showAllButton}>View All</Button>
          ) : null}&nbsp;
          {!viewTabs ? (
            <Button bsStyle="danger" onClick={removeAllButton}>
              <Glyphicon glyph="repeat" />
            </Button>
          ) : null}
        </Row>
        <hr />
        {viewTabs ? (
          <Tab.Container id="tabs-with-dropdown" defaultActiveKey="first">
            <Row className="clearfix">
              <Col sm={12}>
                <Nav bsStyle="tabs">
                  <NavItem eventKey="first" onClick={() => dispUrl('dataSets')}>Datasets</NavItem>
                  <NavItem eventKey="second" onClick={() => dispUrl('indicators')}>Indicators</NavItem>
                  <NavItem eventKey="third" onClick={() => dispUrl('programs')}>Programs</NavItem>
                  <NavItem eventKey="fourth" onClick={() => dispUrl('dataElements')}>Data Elements</NavItem>
                </Nav>
              </Col>
              <Col sm={12}>
                <Tab.Content animation>
                  <Tab.Pane eventKey="first">
                    <ButtonGroupNav item="datasets" />
                  </Tab.Pane>
                  <Tab.Pane eventKey="second">
                    <ButtonGroupNav item="indicators" />
                  </Tab.Pane>
                  <Tab.Pane eventKey="third">
                    <ButtonGroupNav item="programs" />
                  </Tab.Pane>
                  <Tab.Pane eventKey="fourth">
                    <ButtonGroupNav item="dataelements" />
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        ) : null}
      </div>
    </div>
  );
};

export default Tabpane;
