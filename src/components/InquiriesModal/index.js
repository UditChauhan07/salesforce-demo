import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { Steps } from "antd";
import { Row } from "react-bootstrap";
import Correct from "../constant/images/Correct.png";
import { originAPi } from "../../lib/store";

const Required = () => {
  return (
    <small
      style={{
        color: "red",
        border: "1px solid red",
        padding: "0 5px",
        borderRadius: "0.375rem",
      }}
    >
      Required
    </small>
  );
};
const Inquiries = ({ show, onHide }) => {
  const [validated, setValidated] = useState(false);

  const [current, setcurrent] = useState(0);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };

  const [formData, setFormData] = useState({
    first_name: undefined,
    last_name: undefined,
    business_name: undefined,
    address: undefined,
    email: undefined,
    phone: undefined,
    brand: [],
    description: undefined,
    website_link: undefined,
    instagram_link: undefined,
    facebook_link: undefined,
    youtobe_link: undefined,
  });
  const [error, setError] = useState({
    first_name: false,
    last_name: false,
    business_name: false,
    address: false,
    email: false,
    phone: false,
    brand: false,
    description: false,
  });
  const inputHandler = (e) => {
    const { name, value } = e.target;
    if (name == "brand") {
      if (formData.brand.includes(value)) {
        let index = formData.brand.indexOf(value);
        formData.brand.splice(index, 1);
      } else {
        formData.brand.push(value);
      }
      console.warn({ formData });
      setFormData({ ...formData });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const { Step } = Steps;
  const steps = [
    {
      title: "Step",
      content: (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="validationCustom01">
              <Form.Label
                for="first_name"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                First name {error.first_name && <Required />}
              </Form.Label>
              <Form.Control
                required
                type="text"
                name="first_name"
                placeholder="First name"
                onChange={inputHandler}
                value={formData.first_name}
                id="first_name"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            <Form.Group
              for="last_name"
              as={Col}
              md="6"
              controlId="validationCustom02"
            >
              <Form.Label
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                Last name {error.last_name && <Required />}
              </Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Last name"
                name="last_name"
                onChange={inputHandler}
                value={formData.last_name}
                id="last_name"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group
              as={Col}
              for="business_name"
              md="12"
              controlId="validationCustom01"
            >
              <Form.Label
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                Business Name {error.business_name && <Required />}
              </Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Business Name"
                name="business_name"
                onChange={inputHandler}
                id="business_name"
                value={formData.business_name}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label
                for="address"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                Business Physical address {error.address && <Required />}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                onChange={inputHandler}
                placeholder="Business Physical address"
                value={formData.address}
                name="address"
                id="address"
              />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="validationCustom01">
              <Form.Label
                for="email"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                Contact E-mail {error.email && <Required />}
              </Form.Label>
              <Form.Control
                required
                type="email"
                onChange={inputHandler}
                name="email"
                id="email"
                placeholder="Contact E-mail"
                value={formData.email}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="validationCustom02">
              <Form.Label
                for="phone"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                Contact Phone {error.phone && <Required />}
              </Form.Label>
              <Form.Control
                required
                type="number"
                onChange={inputHandler}
                name="phone"
                id="phone"
                placeholder="999999XXXX"
                value={formData.phone}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Row>
        </Form>
      ),
    },
    {
      title: "Step",
      content: (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <div class="HeadingForm">
            <h2>
              <b>Which Manufacturer</b>{" "}
            </h2>
          </div>
          <Row className="mb-3">
            <Form.Group className="mb-3">
              <Form.Label
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                Which Manufacturer(s) are you interested in working with?{" "}
                {error.brand && <Required />}
              </Form.Label>
              <Row className="mb-3">
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Diptyque"
                    feedbackType="invalid"
                    value={"Diptyque"}
                    id={"a0O3b00000fQrZyEAK"}
                    checked={formData.brand.includes("Diptyque") ? true : false}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Byredo"
                    feedbackType="invalid"
                    value={"Byredo"}
                    id={"a0O3b00000hym7GEAQ"}
                    checked={formData.brand.includes("Byredo") ? true : false}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Maison Margiela"
                    feedbackType="invalid"
                    value={"Maison Margiela"}
                    id={"a0O3b00000ffNzbEAE"}
                    checked={
                      formData.brand.includes("Maison Margiela") ? true : false
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Bobbi Brown"
                    feedbackType="invalid"
                    value={"Bobbi Brown"}
                    id={"a0O3b00000p7zqKEAQ"}
                    checked={
                      formData.brand.includes("Bobbi Brown") ? true : false
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Estee Lauder"
                    feedbackType="invalid"
                    value={"estee launder"}
                    id={"a0O1O00000XYBvpqfAH"}
                    checked={
                      formData.brand.includes("Estee Lauder") ? true : false
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="RMS Beauty"
                    feedbackType="invalid"
                    value={"RMS Beauty"}
                    id={"a0O1O00000XYBvQUAX"}
                    checked={
                      formData.brand.includes("RMS Beauty") ? true : false
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="ReVive"
                    feedbackType="invalid"
                    value={"ReVive"}
                    id={"a0O3b00000pY2vqEAC"}
                    checked={formData.brand.includes("ReVive") ? true : false}
                  />
                </Form.Group>

                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="R+Co"
                    feedbackType="invalid"
                    value={"R+Co"}
                    id={"a0O1O00000XYBvefUAH"}
                    checked={formData.brand.includes("R+Co") ? true : false}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="R-Co-Bleu"
                    feedbackType="invalid"
                    value={"R-Co-Bleu"}
                    id={"a0O3b00000pY1wOEeAS"}
                    checked={
                      formData.brand.includes("R-Co-Bleu") ? true : false
                    }
                  />
                </Form.Group>

                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Bumble and Bumble"
                    feedbackType="invalid"
                    value={"Bumble and Bumble"}
                    id={"a0O3b00000p80IJEAY"}
                    checked={
                      formData.brand.includes("Bumble and Bumble")
                        ? true
                        : false
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="BY TERRY"
                    feedbackType="invalid"
                    value={"BY TERRY"}
                    id={"a0O1O00000XYBvaUAH"}
                    checked={formData.brand.includes("BY TERRY") ? true : false}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Susanne Kaufmann"
                    feedbackType="invalid"
                    value={"Susanne Kaufmann"}
                    id={"a0O3b00000p7xfAEAQ"}
                    checked={
                      formData.brand.includes("Susanne Kaufmann") ? true : false
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Kevyn Aucoin Cosmetics"
                    feedbackType="invalid"
                    value={"Kevyn Aucoin Cosmetics"}
                    id={"a0O1O00000XYBvkUAH"}
                    checked={
                      formData.brand.includes("Kevyn Aucoin Cosmetics")
                        ? true
                        : false
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Smashbox"
                    feedbackType="invalid"
                    value={"Smashbox"}
                    id={"a0O3b00000lCFmREAW"}
                    checked={formData.brand.includes("Smashbox") ? true : false}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  {" "}
                  <Form.Check
                    required
                    onChange={inputHandler}
                    name="brand"
                    label="Eve Lom"
                    feedbackType="invalid"
                    value={"Eve Lom"}
                    id={"a0O1O00000gAhRFUA0"}
                    checked={formData.brand.includes("Eve Lom") ? true : false}
                  />
                </Form.Group>
              </Row>
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                Description {error.description && <Required />}
              </Form.Label>
              <Form.Control
                placeholder="Message"
                as="textarea"
                rows={3}
                onChange={inputHandler}
                name="description"
                value={formData.description}
              />
            </Form.Group>
          </Row>
          <div class="HeadingForm">
            <h2>
              <b>Social Media Links</b>{" "}
            </h2>
          </div>
          <Row className="mb-3">
            <Form.Group as={Col} md="12" controlId="website_linkcon">
              <Form.Label for="website_link">Website </Form.Label>
              <Form.Control
                required
                onChange={inputHandler}
                name="website_link"
                id="website_link"
                type="text"
                placeholder="Website"
                value={formData.website_link || ""}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="instagram_linkcon">
              <Form.Label for="instagram_link">Instagram URL</Form.Label>
              <Form.Control
                required
                type="text"
                onChange={inputHandler}
                name="instagram_link"
                id="instagram_link"
                placeholder="Instagram"
                value={formData.instagram_link}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="facebook_linkcon">
              <Form.Label for="facebook_link">Facebook URL</Form.Label>
              <Form.Control
                required
                type="text"
                onChange={inputHandler}
                name="facebook_link"
                id="facebook_link"
                placeholder="facebook"
                value={formData.facebook_link}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Row>
        </Form>
      ),
    },
    {
      title: "Step",
      content: (
        <h1 className="text-center">
          <div className="d-block">
            <div className="m-4">
              <img src={Correct} />
            </div>
            <b>Thank You! We will contact you soon.</b>
          </div>
        </h1>
      ),
    },
  ];
  const next = () => {
    if (current == 0) {
      setError({
        first_name: formData.first_name ? false : true,
        last_name: formData.last_name ? false : true,
        business_name: formData.business_name ? false : true,
        address: formData.address ? false : true,
        email: formData.email ? false : true,
        phone: formData.phone ? false : true,
        brand: false,
        description: false,
      });
      if (
        formData.first_name &&
        formData.last_name &&
        formData.business_name &&
        formData.address &&
        formData.email &&
        formData.phone
      ) {
        setcurrent(current + 1);
        setBtnText("Submit");
      }
    }
    if (current == 1) {
      setError({
        first_name: formData.first_name ? false : true,
        last_name: formData.last_name ? false : true,
        business_name: formData.business_name ? false : true,
        address: formData.address ? false : true,
        email: formData.email ? false : true,
        phone: formData.phone ? false : true,
        brand: formData.brand.length ? false : true,
        description: formData.description ? false : true,
      });
      if (formData.brand.length && formData.description) {
        let Manufacturer__c = "";
        formData.brand.map((e, i) => {
          Manufacturer__c += e;
          if (i != formData.brand.length - 1) {
            Manufacturer__c += ";";
          }
        });
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        };
        fetch(originAPi+"/beauty/login", options)
          .then((res) => res.json())
          .then((json) => {
            if (json.status) {
              if (json.status == 200) {
                try {
                  let body = {
                    FirstName: formData.first_name,
                    LastName: formData.last_name,
                    Company: formData.business_name,
                    Manufacturer__c: Manufacturer__c,
                    Address_for_Samples__c: formData.address,
                    Phone: formData.phone,
                    Email: formData.email,
                    Description: formData.description,
                    Website: formData.website_link,
                    Facebook_URL__c: formData.facebook_link,
                    Instagram_URL__c: formData.instagram_link,
                    Status: "Lead Open in Salesforce",
                    LeadSource: "Web",
                    Payment_Type__c: "Credit Card",
                    Margin__c: "50",
                    Display_or_Assortment__c: "No Display",
                  };
                  // B0F9FC7237TC
                  let bodydata = {
                    link:
                      "https://beautyfashionsales.my.salesforce.com/services/data/v51.0/sobjects/Lead",
                    key: json.data.access_token,
                    data: body,
                  };
                  console.log({ bodydata });
                  const options = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(bodydata),
                  };
                  fetch(
                    originAPi+"/beauty/B0F9FC7237TC",
                    options
                  )
                    .then((res) => res.json())
                    .then((json) => {
                      console.warn({ json });
                      if (json.data.success) {
                        setcurrent(current + 1);
                      } else {
                        alert(
                          "email should be unique. please check it and try it again"
                        );
                      }
                    });
                } catch (err) {
                  alert(err);
                }
              } else {
                alert("Something Went wrong.");
              }
            } else {
              alert("Something Went wrong.");
            }
          });
      }
    }
  };

  const prev = () => {
    setBtnText("Next");
    setcurrent(current - 1);
  };
  const [btnText, setBtnText] = useState("Next");
  return (
    <Modal
      className="ModalCallToAction"
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Inquiry form
        </Modal.Title>
        <button
          type="button"
          class="btn-close"
          onClick={onHide}
          aria-label="Close"
        ></button>
      </Modal.Header>

      <div class="mb-3">
        <Steps current={current}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{steps[current].content}</div>
        <div className="steps-action">
          {current < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              {btnText}
            </Button>
          )}

          {current === steps.length - 1 && (
            <Button type="primary" onClick={onHide}>
              Okay
            </Button>
          )}
          {current > 0 && current !== steps.length - 1 && (
            <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
              Previous
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Inquiries;
