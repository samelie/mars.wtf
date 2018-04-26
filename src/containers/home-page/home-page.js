import "./home-page.scss";

import React, { Component, PropTypes } from "react";
import createFragment from "react-addons-create-fragment";

import { Link } from "react-router";
import { connect } from "react-redux";
import { fetchJson } from "../../utils/fetch";
import Project from "./project";
import ReactHtmlParser from "react-html-parser";

import MarsPlanet from "../../components/mars-planet/mars-planet";

class HomePage extends Component {
  static propTypes = {
    browser: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      copy: null,
      projects: [],
    };
  }

  componentDidMount() {
    let _url = `assets/json/projects.json?z=${Math.random()}`;
    let _j = fetchJson(_url).then(data => {
      this.setState({
        projects: data.map(project => {
          return Project(project);
        }),
      });
    });
    let _copy = `assets/json/copy.json?z=${Math.random()}`;
    fetchJson(_copy).then(data => {
      this.setState({
        copy: data,
      });
    });
  }

  render() {
    const { browser } = this.props;
    const { copy } = this.state;
    if (!copy) {
      return <div />;
    }
    return (
      <div className="o-page">
        <MarsPlanet />
        <div className="o-page home">
          <h1 className="home__title">{copy.pages.home.title}</h1>
          <p className="home__desc">
            {ReactHtmlParser(copy.pages.home.titleDesc)}
          </p>
          {this.state.projects}
        </div>
      </div>
    );
  }
}

export default connect(({ browser }) => ({
  browser,
}))(HomePage);
