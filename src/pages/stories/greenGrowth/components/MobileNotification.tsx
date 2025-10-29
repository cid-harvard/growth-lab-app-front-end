import styled from "@emotion/styled";
import { Modal } from "@mui/material";
import Logo from "../../../../assets/GL_logo_white.png";

const NotificationContainer = styled.div`
  background-color: rgb(27, 31, 47);
  opacity: 0.9;
  position: fixed;
  z-index: 3001;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: 100dvh;
  font-size: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0 0 0 20vw;
`;

const NotificationLogo = styled.img`
  top: 0;
  height: 40px;
  min-height: 45px;
`;

const NotificationMessage = styled.div`
  color: white;
  font-size: 1rem;
  font-weight: 400;
  width: 60vw;
  margin-top: 1rem;
  text-size-adjust: auto;
`;

const NotificationCloseButton = styled.button`
  position: absolute;
  right: 5vw;
  top: 5vw;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
`;

export default function MobileNotification({
  onClose,
}: {
  onClose?: () => void;
}) {
  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="mobile-notification-title"
      aria-describedby="mobile-notification-description"
    >
      <NotificationContainer>
        <div>
          <NotificationLogo
            src={Logo}
            alt="Growth Lab logo"
            id="mobile-notification-title"
          />
        </div>
        <NotificationMessage id="mobile-notification-description">
          <p>
            <span className="bold">Greenplexity</span> is an interactive data
            visualization platform that reveals where countries can lead in the
            green value chains powering the energy transition and drive new
            paths to prosperity.
          </p>
          <p>
            <span className="italicize">
              To explore the data, please open this page in a wider browser
              window.
            </span>
          </p>
        </NotificationMessage>
        <NotificationCloseButton
          onClick={onClose}
          tabIndex={0}
          aria-label="Close notification"
        >
          &#x2715;
        </NotificationCloseButton>
      </NotificationContainer>
    </Modal>
  );
}
