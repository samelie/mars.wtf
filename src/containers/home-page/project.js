import React, { Component } from "react";
import ReactHtmlParser from "react-html-parser";

const PROJECT = props => {
    return (
        <div key={props.id} className="project">
            <a
                className="project__title home__link"
                href={`${props.href}`}
            >
                <img
                    className="project__image"
                    src={`${process.env.REMOTE_ASSETS_DIR}images/${
                        props.id
                    }.gif`}
                />
                <div className="title__text__wrapper">
                    <span className="title__text">{props.title}</span>
                </div>
            </a>
            <div className="project__desc">{props.projectNote}</div>
        </div>
    );
};

export default PROJECT;
