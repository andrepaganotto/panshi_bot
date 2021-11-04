import React, { useState } from "react";
import SimpleBar from 'simplebar-react';
import { useLocation, useHistory } from "react-router-dom";
import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faCog, faRobot, faSignOutAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Dropdown, Navbar } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';
import authService from '../services/AuthService';

import panshiLogo from "../assets/img/logo01.png";

export default function Menu (props = {}) {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const showClass = show ? "show" : "";
  const history = useHistory();

  const onCollapse = () => setShow(!show);

  const NavItem = (props) => {
    const { title, link, external, target, icon, image, badgeText, onClick, className, badgeBg = "secondary", badgeColor = "primary" } = props;
    const classNames = badgeText ? "d-flex justify-content-start align-items-center justify-content-between" : "";
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} onClick={onClick ? onClick : () => setShow(false)}>
        <Nav.Link {...linkProps} target={target} className={classNames}>
          <span>
            {icon ? <span className={title === 'Sair' ? 'text-danger me-2' : "sidebar-icon"}><FontAwesomeIcon icon={icon} /> </span> : null}
            {image ? <Image src={image} width={20} height={20} className="sidebar-icon svg-icon" /> : null}

            <span className="sidebar-text">{title}</span>
          </span>
          {badgeText ? (
            <Badge pill bg={badgeBg} text={badgeColor} className="badge-md notification-count ms-2">{badgeText}</Badge>
          ) : null}
        </Nav.Link>
      </Nav.Item>
    );
  };

  const handleLogout = (event) => {
    event.preventDefault();
    try {
      authService.logout();
      history.push('/');
    }
    catch (err) {
      setError(err);
    }
  }

  return (
    <>

      <Navbar expand={false} collapseOnSelect variant="dark" className="navbar-theme-primary px-4 d-md-none">
        <Navbar.Brand className="me-lg-5" as={Link} to='/dashboard'>
          <Image src={panshiLogo} className="navbar-brand-light" />
        </Navbar.Brand>
        <Navbar.Toggle as={Button} aria-controls="main-navbar" onClick={onCollapse}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>

      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}>
          <div className="sidebar-inner px-4 pt-3">
            <Nav className="flex-column pt-3 pt-md-0">

              <div className="user-card d-flex align-items-center justify-content-between pb-3 my-3">
                <div className='d-flex align-items-center ms-2'>
                  <Image src={panshiLogo} />
                </div>

                <div className='d-flex align-items-center ms-3'>
                  <h5 className='mb-0'>Panshi</h5>
                </div>
                
                <div className="d-flex align-items-center ms-auto">
                  <Nav.Link className="collapse-close d-md-none" onClick={onCollapse}>
                    <FontAwesomeIcon icon={faTimes} />
                  </Nav.Link>
                </div>
              </div>

              <NavItem title="Dashboard" icon={faChartPie} link='/dashboard' />
              <NavItem title="Automações" icon={faRobot} link='/automations' />
              <NavItem title="Configurações" icon={faCog} link='/settings' />

              <Dropdown.Divider className="my-3 border-indigo" />

              <NavItem title="Sair" icon={faSignOutAlt} link='/' onClick={handleLogout} />

            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>

    </>
  );
};
