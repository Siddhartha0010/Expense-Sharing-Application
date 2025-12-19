FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

# Give execute permission to mvnw
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Rename the jar to a fixed name
RUN mv target/*.jar app.jar

EXPOSE 10000

# Run the app
CMD ["java", "-jar", "app.jar"]
