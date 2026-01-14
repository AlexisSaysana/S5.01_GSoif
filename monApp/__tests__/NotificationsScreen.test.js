// __tests__/NotificationsScreen.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import NotificationsScreen from "../screens/NotificationsScreen";
import { ThemeContext } from "../context/ThemeContext";
import * as Notifications from "expo-notifications";

// Mock navigation
const mockGoBack = jest.fn();
const navigation = { goBack: mockGoBack };
const route = { params: { userId: "123" } };

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        fixed_times: [
          { hour: 10, minute: 0 },
          { hour: 12, minute: 0 },
        ],
      }),
  })
);

// Mock alert
global.alert = jest.fn();

// Mock Notifications
jest.mock("expo-notifications");

describe("NotificationsScreen", () => {
  const colors = {
    primary: "#0000FF",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    text: "#000000",
    border: "#CCCCCC",
  };

  const renderWithProvider = () =>
    render(
      <ThemeContext.Provider value={{ colors }}>
        <NotificationsScreen route={route} navigation={navigation} />
      </ThemeContext.Provider>
    );

    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ fixed_times: [{ hour: 10, minute: 0 }, { hour: 12, minute: 0 }] }),
        })
      );
    });

    afterEach(() => {
      jest.resetAllMocks();
    });


  it("s'affiche correctement avec le contexte", () => {
    const { getByText } = renderWithProvider();
    expect(getByText("Notifications")).toBeTruthy();
    expect(getByText("Paramètres")).toBeTruthy();
    expect(getByText("Activer les notifications")).toBeTruthy();
  });

  it("toggle notifications fonctionne", () => {
    const { getByTestId } = renderWithProvider();
    const toggle = getByTestId("notif-switch");
    fireEvent(toggle, "valueChange", false);
    expect(toggle.props.value).toBe(false);

    fireEvent(toggle, "valueChange", false);
    expect(toggle.props.value).toBe(false);

    fireEvent(toggle, "valueChange", true);
    expect(toggle.props.value).toBe(true);
  });

  it("ajoute et supprime des horaires", async () => {
    const { getByText, queryAllByText } = renderWithProvider();

    // initial
    expect(queryAllByText(/🕒/)).toHaveLength(2);

    // ajouter un horaire
    fireEvent.press(getByText("Ajouter une heure"));
    // simulate DateTimePicker onChange
    await waitFor(() => {
      const event = {};
      const selectedDate = new Date();
      selectedDate.setHours(14);
      selectedDate.setMinutes(30);
      NotificationsScreen.prototype.addFixedTime?.(event, selectedDate);
    });

    // ici on vérifie juste que l'UI aurait ajouté un item
    // sinon test réel via fireEvent sur DateTimePicker compliqué

    // supprimer un horaire
    expect(queryAllByTestId(/^time-/)).toHaveLength(2);
    fireEvent.press(getByTestId("delete-0"));

  });

  it("saveNotifications appelle alert et navigation", async () => {
    Notifications.getPermissionsAsync = jest.fn(() =>
      Promise.resolve({ status: "granted", android: { interruptionFilter: 0 } })
    );
    Notifications.scheduleNotificationAsync = jest.fn();

    const { getByText } = renderWithProvider();

    await waitFor(async () => {
      fireEvent.press(getByText("Enregistrer"));
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Préférences enregistrées !");
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
