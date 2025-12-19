FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

# FIX: give execute permission to mvnw
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

EXPOSE 10000

CMD ["java", "-jar", "target/*.jar"]
