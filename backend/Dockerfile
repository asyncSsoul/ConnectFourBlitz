# Этап 1: Сборка (если хотите собирать прямо внутри докера)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Этап 2: Финальный образ
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Копируем только скомпилированный jar из этапа сборки
COPY --from=build /app/target/backend-app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]